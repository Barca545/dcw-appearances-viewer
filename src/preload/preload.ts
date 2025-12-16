// TODO: If this ends up being overly granular merge taking inspiration from
// https://stackoverflow.com/a/66270356/24660323
import { DisplayOptions } from "src/common/apiTypes";
import { APIEvent, SerializedTabBarState, TabID } from "../common/ipcAPI";
import type { TabDataUpdate, SerializedTab, Settings, SearchRequest } from "../common/TypesAPI";
import { contextBridge, ipcRenderer } from "electron";
// REMINDER: Handle only takes invokes not sends
console.log("PRELOAD RUNNING...");

contextBridge.exposeInMainWorld("API", {
  settings: {
    request: async (): Promise<Settings> => ipcRenderer.invoke(APIEvent.SettingsRequest),
    /**Save the new settings to the disk. */
    save: (data: Settings) => ipcRenderer.send(APIEvent.SettingsSave, data),
    /**Request a preview of the settings but do not save them to disk. */
    apply: (data: Settings) => ipcRenderer.send(APIEvent.SettingsApply, data),
  },
  tabBar: {
    requestTabBarState: (): Promise<SerializedTabBarState> => ipcRenderer.invoke(APIEvent.TabBarRequestState),
    /** Requests the main process update its tab list to match the order of the data set over. Returns the main process' tab list.*/
    requestUpdate: (state: SerializedTabBarState): Promise<SerializedTabBarState> =>
      ipcRenderer.invoke(APIEvent.TabBarRequestUpdate, state),
    /** Registers a handler to process an update in the tab bar's state sent from the main process. */
    update: (fn: (state: SerializedTabBarState) => void) =>
      ipcRenderer.on(APIEvent.TabBarUpdate, (_e, state: SerializedTabBarState) => fn(state)),
  },
  /**Updata data for a tab. */
  tab: {
    /**Returns the state of the current `Tab`. */
    requestTabState: (): Promise<SerializedTab> => ipcRenderer.invoke(APIEvent.TabRequestState),
    setCurrent: (ID: TabID) => ipcRenderer.send(APIEvent.TabUpdateCurrent, ID),
    /**Submits the form to the main process and returns the result to the renderer. */
    search: (req: SearchRequest) => ipcRenderer.send(APIEvent.TabSearch, req),
    update: (fn: (res: TabDataUpdate) => void) => {
      const ref = (_e: Electron.IpcRendererEvent, res: TabDataUpdate) => fn(res);
      ipcRenderer.on(APIEvent.TabUpdate, ref);
      return () => ipcRenderer.off(APIEvent.TabUpdate, ref);
    },
    /** Process request from the main process to navigate to a new project tab.
     *
     * **NOTE**: Does not update the tab. Updating must be handled separately.*/
    go: (fn: (id: TabID) => void) => ipcRenderer.on(APIEvent.TabGo, (_e, id: TabID) => fn(id)),
    close: (ID: TabID) => ipcRenderer.send(APIEvent.TabClose, ID),
    // TODO: Debating if I should do this, it would would but require the exact same function ref be passed to both
    // subscribe: (handler: (_e: Electron.IpcRendererEvent, res: TabData) => void) => ipcRenderer.on("update:emit", handler),
    // unsubscribe: (handler: (_e: Electron.IpcRendererEvent, res: TabData) => void) => ipcRenderer.off("update:emit", handler),
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
    requestOptionsUpdate: (state: DisplayOptions): Promise<DisplayOptions> =>
      ipcRenderer.invoke(APIEvent.DisplayOptionsRequestUpdate, state),
    update: (fn: (state: DisplayOptions) => void) => ipcRenderer.on(APIEvent.DisplayOptionsUpdate, (_e, state) => fn(state)),
  },
});

console.log("PRELOAD FINSHED...");
