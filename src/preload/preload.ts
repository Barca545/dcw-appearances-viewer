// TODO: If this ends up being overly granular merge taking inspiration from
// https://stackoverflow.com/a/66270356/24660323
import { UserErrorInfo } from "src/main/log";
import { DisplayOptions, Settings } from "../common/apiTypes";
import { APIEvent, SerializedTabBarState, TabID } from "../common/ipcAPI";
import type { TabDataUpdate, SerializedTab, SearchRequest, SerializedSettingsTab, SettingsTabUpdate } from "../common/TypesAPI";
import { contextBridge, ipcRenderer } from "electron";
// REMINDER: Handle only takes invokes not sends
console.log("PRELOAD RUNNING...");

contextBridge.exposeInMainWorld("API", {
  settings: {
    request: async (): Promise<Settings> => ipcRenderer.invoke(APIEvent.SettingsRequest),
    /**Save the new settings to the disk. */
    save: (data: SettingsTabUpdate) => ipcRenderer.send(APIEvent.SettingsSave, data),
    reset: (ID: TabID) => ipcRenderer.send(APIEvent.SettingsReset, ID),
    onUpdate: (fn: (state: SerializedSettingsTab) => void) => ipcRenderer.on(APIEvent.SettingsUpdate, (_e, state) => fn(state)),
    removeUpdateListener: () => ipcRenderer.removeAllListeners(APIEvent.SettingsUpdate),
  },
  tabBar: {
    requestTabBarState: (): Promise<SerializedTabBarState> => ipcRenderer.invoke(APIEvent.TabBarRequestState),
    /** Requests the main process update its tab list to match the order of the data set over. Returns the main process' tab list.*/
    requestUpdate: (state: SerializedTabBarState): Promise<SerializedTabBarState> =>
      ipcRenderer.invoke(APIEvent.TabBarRequestUpdate, state),
    /** Registers a handler to process an update in the tab bar's state sent from the main process. */
    onUpdate: (fn: (state: SerializedTabBarState) => void) =>
      ipcRenderer.on(APIEvent.TabBarUpdate, (_e, state: SerializedTabBarState) => fn(state)),
    removeUpdateListener: () => ipcRenderer.removeAllListeners(APIEvent.TabBarUpdate),
  },
  /**Updata data for a tab. */
  tab: {
    /**Returns the state of the current `Tab`. */
    requestTabState: (): Promise<SerializedTab> => ipcRenderer.invoke(APIEvent.TabRequestState),
    setCurrent: (ID: TabID) => ipcRenderer.send(APIEvent.TabUpdateCurrent, ID),
    /**Submits the form to the main process and returns the result to the renderer. */
    search: (req: SearchRequest) => ipcRenderer.send(APIEvent.TabSearch, req),
    onUpdate: (fn: (res: TabDataUpdate) => void) => ipcRenderer.on(APIEvent.TabUpdate, (_e, update) => fn(update)),
    removeUpdateListeners: () => ipcRenderer.removeAllListeners(APIEvent.TabUpdate),
    /** Process request from the main process to navigate to a new project tab.
     *
     * **NOTE**: Does not update the tab. Updating must be handled separately.*/
    go: (fn: (id: TabID) => void) => ipcRenderer.on(APIEvent.TabGo, (_e, id: TabID) => fn(id)),
    close: (ID: TabID) => ipcRenderer.send(APIEvent.TabClose, ID),
  },
  open: {
    /**Open a new tab. Returns the tab's data.*/
    tab: () => ipcRenderer.send(APIEvent.OpenTab),
    /**Open a project file in the current tab. Returns the tab's data. */
    file: () => ipcRenderer.send(APIEvent.OpenFile),
    /**Open a Web URL in the default browser. */
    url: (addr: string) => ipcRenderer.send(APIEvent.OpenURL, addr),
  },
  /**Update the `FilterOptions` stored in the main process. */
  displayOptions: {
    requestOptionsState: (): Promise<DisplayOptions> => ipcRenderer.invoke(APIEvent.DisplayOptionsRequestState),
    requestOptionsUpdate: (state: DisplayOptions) => ipcRenderer.send(APIEvent.DisplayOptionsRequestUpdate, state),
    onUpdate: (fn: (state: DisplayOptions) => void) => ipcRenderer.on(APIEvent.DisplayOptionsUpdate, (_e, state) => fn(state)),
  },
});

contextBridge.exposeInMainWorld("ERROR", {
  submit: (data: UserErrorInfo) => ipcRenderer.send("error:submit", data),
});

console.log("PRELOAD FINSHED...");
