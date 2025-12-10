import type { Settings, TabData, SearchRequest, AppPage, FilterOrder, FilterDensity } from "./apiTypes";
import { TabID } from "./TypesAPI";

export type VoidReturnFunction = () => void;

const enum APIEvent {
  SettingsRequest = "settings:request",
  SettingsApply = "settings:apply",
  SettingsSave = "settings:save",
  TabRequest = "tab:request",
  TabUpdate = "tab:update",
  TabGo = "tab:go",
  TabClose = "tab:close",
  OpenPage = "open:page",
  OpenFile = "open:file",
  OpenURL = "open:URL",
  FilterOrder = "filter:order",
  FilterDensity = "filter:density",
  FilterAsc = "filter:asc",
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
      /**Handle requests which change a tab's state. */
      tab: {
        /**Submits the form to the main process and returns the result to the renderer. */
        request: (data: SearchRequest) => Promise<TabData>;
        /** Process request from the main process to navigate to a new project tab.
         *
         * **NOTE**: Does not update the tab. Updating must be handled separately.*/
        go: (fn: (route: string, data?: TabData) => void) => void;
        /**Register a callback for when an incoming update event occurs. Returns a function to unsubscribe. */
        update: (fn: (data: TabData) => void) => VoidFunction;
      };
      open: {
        /**Open a new `AppPage` in the current tab. */
        page: () => Promise<>;
        /**Open a Web URL in the default browser. */
        url: (addr: string) => void;
        // TODO: Eventually should open in a new tab
        /**Open a project file in the current tab. */
        file: VoidFunction;
      };
      /**Update the `FilterOptions` stored in the main process. */
      filter: {
        /**Set a new value for the App's filter order. */
        order: (order: FilterOrder) => void;
        /**Set a new value for the App's filter density. */
        density: (density: FilterDensityUpdate) => void;
        /**Set a new value for the App's filter ascent direction. */
        ascending: (asc: boolean) => void;
      };
    };
  }
}

interface APIEventMap {
  [APIEvent.TabUpdate]: TabData;
  [APIEvent.SettingsRequest]: Settings;
  [APIEvent.TabGo]: TabID;
}
