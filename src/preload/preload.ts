// TODO: If this ends up being overly granular merge taking inspiration from
// https://stackoverflow.com/a/66270356/24660323
import { UserErrorInfo } from "src/main/log";
import { DisplayOptions, Settings } from "../common/apiTypes";
import { APIEvent, SerializedTabBarState, TabID } from "../common/ipcAPI";
import type {
  TabDataUpdate,
  SerializedTab,
  SearchRequest,
  SerializedSettingsTab,
  SettingsTabUpdate,
  SerializedAppTab,
} from "../common/TypesAPI";
import { contextBridge, ipcMain, ipcRenderer } from "electron";
// REMINDER: Handle only takes invokes not sends
console.log("PRELOAD RUNNING...");

contextBridge.exposeInMainWorld("API", {
  settings: {
    request: async (): Promise<Settings> => ipcRenderer.invoke(APIEvent.SettingsRequest),
    save: (data: SettingsTabUpdate) => ipcRenderer.send(APIEvent.SettingsSave, data),
    reset: (ID: TabID) => ipcRenderer.send(APIEvent.SettingsReset, ID),
    onUpdate: (fn: (state: SerializedSettingsTab) => void) => ipcRenderer.on(APIEvent.SettingsUpdate, (_e, state) => fn(state)),
    removeUpdateListener: () => ipcRenderer.removeAllListeners(APIEvent.SettingsUpdate),
  },
  app: {
    request: (ID: TabID) => ipcRenderer.invoke(APIEvent.AppTabRequest, ID),
    search: (req: SearchRequest) => ipcRenderer.invoke(APIEvent.AppTabSearch, req),
    onUpdate: (fn: (state: TabDataUpdate) => void) => {
      const handler = (_e: Electron.IpcRendererEvent, state: SerializedAppTab) => fn(state);
      ipcRenderer.on(APIEvent.AppTabUpdate, handler);
      return () => ipcRenderer.removeListener(APIEvent.AppTabUpdate, handler);
    },
  },
  tabBar: {
    request: (): Promise<SerializedTabBarState> => ipcRenderer.invoke(APIEvent.TabBarRequestState),
    onUpdate: (fn: (state: SerializedTabBarState) => void) => {
      const handler = (_e: Electron.IpcRendererEvent, state: SerializedTabBarState) => fn(state);
      ipcRenderer.on(APIEvent.TabBarUpdate, handler);
      return () => ipcRenderer.removeListener(APIEvent.TabBarUpdate, handler);
    },
    navigateToTab: (ID: TabID) => ipcRenderer.invoke(APIEvent.TabUpdateCurrent, ID),
    openAndNavigateToTab: (ID: TabID) => ipcRenderer.invoke(APIEvent.TabBarOpenAndUpdateCurrent, ID),
    closeTab: (ID: TabID) => ipcRenderer.invoke(APIEvent.TabBarClose, ID),
    reorderTabs: (state: SerializedTabBarState) => ipcRenderer.invoke(APIEvent.TabBarReorder, state),
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
