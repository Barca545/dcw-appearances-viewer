import { UUID } from "crypto";
import {
  DisplayDensityUpdate,
  DisplayDirectionUpdate,
  DisplayOrderUpdate,
  SearchRequest,
  Settings,
  TabDataUpdate,
  TabMetaData,
} from "./TypesAPI";

export type VoidReturnFunction = () => void;

export enum APIEvent {
  // TODO: Merge tabs and tabbar here and in preload
  TabBarRequestState = "tabar:request-state",
  TabBarRequestUpdate = "tabar:request-update",
  TabBarUpdate = "tabbar:update",
  SettingsRequest = "settings:request",
  SettingsApply = "settings:apply",
  SettingsSave = "settings:save",
  TabUpdateCurrent = "tab:setCurrent",
  TabSearch = "tab:search",
  TabUpdate = "tab:update",
  TabGo = "tab:go",
  TabClose = "tab:close",
  OpenTab = "open:tab",
  OpenFile = "open:file",
  OpenURL = "open:URL",
  FilterOrder = "filter:order",
  FilterDensity = "filter:density",
  FilterAsc = "filter:asc",
}

// TODO: Use this once we switch to single source of truth
export interface SerializedTabBarState {
  readonly selected: TabID;
  readonly list: TabMetaData[];
}

export type TabID = UUID;

export namespace TabID {
  /** Creates a new `TabID`. */
  export function create(): TabID {
    return crypto.randomUUID();
  }
}

declare global {
  interface Window {
    API: {
      settings: {
        request: () => Promise<Settings>;
        /**Save the new settings to the disk. */
        save: (data: Settings) => void;
        /**Send settings data to the main process without saving it to file. Previews the result of the changes.*/
        apply: (data: Settings) => void;
      };
      tabBar: {
        requestTabBarState: () => Promise<SerializedTabBarState>;
        /** Requests the main process update its tab list to match the order of the data set over. Returns the main process' tab list.*/
        requestUpdate: (state: SerializedTabBarState) => Promise<SerializedTabBarState>;
        /** Registers a handler to process an update in the tab bar's state sent from the main process. */
        update: (fn: (state: SerializedTabBarState) => void) => void;
      };
      /**Handle requests which change a tab's state. */
      tab: {
        /**Notify the main process the user has switched to a new tab. */
        setCurrent: (ID: TabID) => void;
        /**Submits the form to the main process and returns the result to the renderer. */
        search: (data: SearchRequest) => Promise<TabDataUpdate>;
        // TODO: Confirm whether go is ever handled
        /** Process request from the main process to navigate to a new project tab.
         *
         * **NOTE**: Does not update the tab. Updating must be handled in the passed callback.*/
        go: (fn: (route: string, data?: TabDataUpdate) => void) => void;
        /**Register a callback for when an incoming update event occurs. Returns a function to unsubscribe. */
        update: (fn: (data: TabDataUpdate) => void) => void;
      };
      open: {
        /**Create a new Application Tab. Returns the tabs `TabData`. */
        tab: () => void;
        /**Open a Web URL in the default browser. */
        url: (addr: string) => void;
        // TODO: Eventually should open in a new tab
        /**Open a project file in the current tab. */
        file: () => void;
      };
      /**Update the `FilterOptions` stored in the main process. */
      filter: {
        /**Set a new value for the App's filter order. */
        order: (order: DisplayOrderUpdate) => void;
        /**Set a new value for the App's filter density. */
        density: (density: DisplayDensityUpdate) => void;
        /**Set a new value for the App's filter ascent direction. */
        ascending: (asc: DisplayDirectionUpdate) => void;
      };
    };
  }
}
