import { UUID } from "crypto";
import { SearchRequest, SerializedAppTab, SerializedSettingsTab, SettingsTabUpdate } from "./TypesAPI";
import { DisplayOptions } from "../main/displayOptions";
import { Settings } from "../main/settings";
import { UserErrorInfo as ErrorReport, RendererLog } from "src/main/log";
import { TabMetaData } from "src/main/tab";

export type VoidReturnFunction = () => void;

export enum IPCEvent {
  // Settings Events
  SettingsRequest = "settings:request",
  SettingsUpdate = "settings:update",
  SettingsSave = "settings:save",
  SettingsReset = "settings:reset",
  // App Events
  AppRequest = "app:request",
  AppUpdate = "app:update",
  AppSearch = "app:search",
  AppDisplayRequest = "app:display:request",
  AppDisplayApply = "app:display:apply",
  AppDisplayUpdate = "app:display:update",
  AppSetDisplayOptions = "app:display:set",
  // Start Events
  StartOpenNew = "start:open:new",
  StartOpenFile = "start:open:file",
  // Tab bar Events
  TabRequest = "tab:request",
  /**Incoming update from the main process. */
  TabUpdate = "tab:update",
  /**Navigate to a new tab. */
  TabGo = "tab:go",
  /**Open a new tab and navigate to it. */
  TabOpen = "tab:open",
  TabReorder = "tab:reorder",
  TabClose = "tab:close",
  // Misc.
  OpenURL = "open:url",
}

export enum IPCError {
  Submit = "error:submit",
  Log = "error:log",
}

// TODO: Use this once we switch to single source of truth
export interface SerializedTabBarState {
  readonly selected: TabMetaData;
  readonly list: { TabType: "APP" | "START" | "SETTINGS"; meta: TabMetaData; isClean: boolean }[];
}

// TODO: These should probably be in the tab file not here
export type TabID = UUID;
export type TabURL = `/${"app" | "settings" | "start"}/${TabID}`;

export namespace TabID {
  /** Creates a new `TabID`. */
  export function create(): TabID {
    return crypto.randomUUID();
  }
}

declare global {
  interface Window {
    ERROR: {
      log: (error: RendererLog) => void;
      /**Submit an error report.*/
      submit: (info: ErrorReport) => void;
    };
    API: {
      appTab: {
        /**Request the AppTab's data from the main process. */
        request: (ID: TabID) => Promise<SerializedAppTab>;
        /**Registers a handler function for the `IPCAppTabEvent.Update` event and returns its unsubscribe function. */
        onUpdate: (fn: (data: SerializedAppTab) => void) => VoidReturnFunction;
        /**Submits the form to the main process and returns the result to the renderer. */
        search: (data: SearchRequest) => void;
        setDisplayOptions: (ID: TabID, opts: DisplayOptions) => void;
      };
      settingsTab: {
        /**Request the Settings data from the main process. */
        request: () => Promise<Settings>;
        /**Registers a handler function for the `IPCSettingsTabEvent.Update` event and returns its unsubscribe function. */
        onUpdate: (fn: (data: SerializedSettingsTab) => void) => VoidReturnFunction;
        /**Send new Settings data to the main process and save it to the disk.
         * Returns the main process' current Settings' state.*/
        save: (data: SettingsTabUpdate) => Promise<Settings>;
        /**Reset Settings to its default configuration.
         * Returns the main process' current Settings' state.*/
        reset: () => Promise<Settings>;
      };
      startTab: {
        /**Tell the main process to convert the specified [start] tab into a new App tab. */
        openNew: (ID: TabID) => void;
        /**Tell the main process to load a project file into the specified [start] tab. */
        openFile: (ID: TabID) => void;
      };
      /**Handle requests which change a tab's state. */
      tabBar: {
        /**Requests the current state of the tab bar from the main process. */
        request: () => Promise<SerializedTabBarState>;
        /**Registers a handler function for the APIEvent.TabBarUpdate event and returns its unsubscribe function. */
        onUpdate: (fn: (state: SerializedTabBarState) => void) => VoidReturnFunction;
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
      /**Open a Web URL in the default browser. */
      openURL: (addr: string) => void;
    };
  }
}
