import { UUID } from "crypto";
import { SearchRequest, SerializedSettingsTab, SerializedTab, SettingsTabUpdate, TabDataUpdate, TabMetaData } from "./TypesAPI";
import { DisplayOptions, Settings } from "./apiTypes";
import { UserErrorInfo } from "src/main/log";

export type VoidReturnFunction = () => void;

export enum APIEvent {
  // TODO: Merge tabs and tabbar here and in preload
  TabBarRequestState = "tabar:request:state",
  TabBarRequestUpdate = "tabar:request:update",
  TabBarUpdate = "tabbar:update",
  SettingsRequest = "settings:request",
  SettingsSave = "settings:save",
  SettingsUpdate = "settings:update",
  SettingsReset = "setting:reset",
  /**Returns the state of the current tab */
  TabRequestState = "tab:request:state",
  TabUpdateCurrent = "tab:setCurrent",
  TabSearch = "tab:search",
  TabUpdate = "tab:update",
  TabGo = "tab:go",
  TabClose = "tab:close",
  OpenTab = "open:tab",
  OpenFile = "open:file",
  OpenURL = "open:URL",
  DisplayOptionsRequestState = "displayopts:request:state",
  DisplayOptionsRequestUpdate = "displayopts:request:update",
  /**A request from the renderer for the main process to set the display options equal to the payload. */
  DisplayOptionsUpdate = "displayopts:update",
  Error = "ERROR",
  VisualUpdateFontSize = "visualupdate:fontsize",
}

// TODO: Use this once we switch to single source of truth
export interface SerializedTabBarState {
  readonly selected: TabID;
  readonly list: { TabType: "APP" | "START" | "SETTINGS"; meta: TabMetaData; isClean: boolean }[];
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
    ERROR: {
      submit: (info: UserErrorInfo) => void;
    };
    API: {
      settings: {
        request: () => Promise<Settings>;
        /**Save the new settings to the disk. */
        save: (data: SettingsTabUpdate) => void;
        reset: (ID: TabID) => void;
        close: () => void;
        onUpdate: (fn: (state: SerializedSettingsTab) => void) => void;
        removeUpdateListener: () => void;
      };
      tabBar: {
        requestTabBarState: () => Promise<SerializedTabBarState>;
        /** Requests the main process update its tab list to match the order of the data set over. Returns the main process' tab list.*/
        requestUpdate: (state: SerializedTabBarState) => Promise<SerializedTabBarState>;
        /** Registers a handler to process an update in the tab bar's state sent from the main process. */
        onUpdate: (fn: (state: SerializedTabBarState) => void) => void;
        removeUpdateListener: () => void;
      };
      /**Handle requests which change a tab's state. */
      tab: {
        requestTabState: () => Promise<SerializedTab>;
        /**Notify the main process the user has switched to a new tab. */
        setCurrent: (ID: TabID) => void;
        /**Submits the form to the main process and returns the result to the renderer. */
        search: (data: SearchRequest) => void;
        // TODO: Confirm whether go is ever handled
        /** Process request from the main process to navigate to a new project tab.
         *
         * **NOTE**: Does not update the tab. Updating must be handled in the passed callback.*/
        go: (fn: (route: string, data?: TabDataUpdate) => void) => void;
        /**Register a callback for when an incoming update event occurs. */
        onUpdate: (fn: (data: TabDataUpdate) => void) => void;
        removeUpdateListeners: () => void;

        close: (ID: TabID) => void;
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
      displayOptions: {
        /**Request the main process send the current `Tab`'s `DisplayOptions`.*/
        requestOptionsState: () => Promise<DisplayOptions>;
        /**Request the main process set the current `Tab`'s `DisplayOptions` to match the payload.*/
        requestOptionsUpdate: (state: DisplayOptions) => void;
        /**An incoming update from the main process of the current `Tab`'s `DisplayOptions`' state.*/
        onUpdate: (fn: (state: DisplayOptions) => void) => void;
      };
    };
  }
}
