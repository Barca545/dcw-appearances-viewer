import { UUID } from "crypto";
import {
  DisplayDensityUpdate,
  DisplayDirectionUpdate,
  DisplayOrderUpdate,
  SearchRequest,
  Settings,
  TabDataUpdate,
} from "./TypesAPI";

export type VoidReturnFunction = () => void;

export enum APIEvent {
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

type TabIDInner = UUID;

export class TabID {
  id: TabIDInner;

  private constructor(id: UUID) {
    this.id = id;
  }

  static new(): TabID {
    return new TabID(crypto.randomUUID());
  }

  static from(value: SerializedTabID): TabID {
    return new TabID(value);
  }
}

export type SerializedTabID = TabIDInner;

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
      /**Handle requests which change a tab's state. */
      tab: {
        /**Notify the main process the user has switched to a new tab. */
        setCurrent: (ID: SerializedTabID) => void;
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
