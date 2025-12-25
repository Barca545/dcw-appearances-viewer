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

// TODO: This could maybe be a .d.ts since it has no functions and really is fufilling that purpose

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
  // Start Events
  StartOpenNew = "start:open:new",
  StartOpenFile = "start:open:file",
  // Tab bar Events
  TabRequest = "tab:request",
  TabUpdate = "tab:update",
  TabOpen = "tab:open",
  TabReorder = "tab:reorder",
  TabClose = "tab:close",
  // Misc.
  OpenURL = "open:url",
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
      appTab: {
        /**Request the AppTab's data from the main process. */
        request: (ID: TabID) => Promise<SerializedAppTab>;
        /**Registers a handler function for the `IPCAppTabEvent.Update` event and returns its unsubscribe function. */
        onUpdate: (fn: (data: SerializedAppTab) => void) => UnsubscribeFunction;
        /**Submits the form to the main process and returns the result to the renderer. */
        search: (data: SearchRequest) => Promise<SerializedAppTab>;
        setDisplayOptions: (opts: DisplayOptions) => void;
      };
      settingsTab: {
        /**Request the Settings data from the main process. */
        request: () => Promise<Settings>;
        /**Registers a handler function for the `IPCSettingsTabEvent.Update` event and returns its unsubscribe function. */
        onUpdate: (fn: (data: SerializedSettingsTab) => void) => UnsubscribeFunction;
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
        onUpdate: (fn: (state: SerializedTabBarState) => void) => UnsubscribeFunction;
        /**Notify the main process the user is attempting to switch another tab.
         * Returns the state of the main process tabs.
         */
        navigateToTab: (ID: TabID) => Promise<SerializedTabBarState>;
        /**Notify the main process the user is attempting to navigate to another tab.
         * Returns the state of the main process tabs.
         */
        openAndNavigateToTab: () => Promise<SerializedTabBarState>;
        /**Notify the main process the user is attempting to navigate to open a tab at the provided ID.
         * Returns the state of the main process tabs.
         */
        openTabIn: (ID: TabID) => Promise<SerializedTabBarState>;
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
