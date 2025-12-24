import { UUID } from "crypto";
import {
  SearchRequest,
  SerializedAppTab,
  SerializedSettingsTab,
  SettingsTabUpdate,
  TabDataUpdate,
  TabMetaData,
} from "./TypesAPI";
import { DisplayOptions, Settings } from "./apiTypes";
import { UserErrorInfo } from "src/main/log";

export type VoidReturnFunction = () => void;

export enum APIEvent {
  // TODO: Merge tabs and tabbar here and in preload
  TabBarRequestState = "tabar:request:state",
  TabBarUpdate = "tabbar:update",
  TabBarOpenAndUpdateCurrent = "tabbar:open",
  TabBarReorder = "tabbar:reorder",
  TabBarClose = "tab:close",
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

type UnsubscribeFunction = () => void;

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
      appTab: {
        /**Request the AppTab's data. */
        request: (ID: TabID) => Promise<SerializedAppTab>;
        /**Submits the form to the main process and returns the result to the renderer. */
        search: (data: SearchRequest) => void;
        /**Registers a handler function for the APIEvent.AppTabUpdate event and returns its unsubscribe function. */
        onUpdate: (fn: (data: TabDataUpdate) => void) => UnsubscribeFunction;
      };
      settingsTab: {};
      startTab: {};
      /**Handle requests which change a tab's state. */
      tabBar: {
        /**Requests the current state of the tab bar from the main process. */
        request: () => Promise<SerializedTabBarState>;
        /**Registers a handler function for the APIEvent.TabBarUpdate event and returns its unsubscribe function. */
        onUpdate: (fn: (state: SerializedTabBarState) => void) => UnsubscribeFunction;
        /**Notify the main process the user is attempting to switch another tab.
         * Returns the state of the main process tabs.
         */
        navigateToTab: (ID: TabID) => Promise<SerializedTabBarState>;
        /**Notify the main process the user is attempting to navigate to another tab.
         * Returns the state of the main process tabs.
         */
        openAndNavigateToTab: () => Promise<SerializedTabBarState>;
        /**Notify the main process the user is attempting to close a tab.
         * Returns the state of the main process tabs.*/
        closeTab: (ID: TabID) => Promise<SerializedTabBarState>;
        /**Notify the main process the user has reordered the tabs.
         * Returns the state of the main process tabs.
         */
        reorderTabs: (state: SerializedTabBarState) => Promise<SerializedTabBarState>;
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
