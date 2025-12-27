// TODO: If this ends up being overly granular merge taking inspiration from
// https://stackoverflow.com/a/66270356/24660323
import { RendererLog, UserErrorInfo } from "src/main/log";
import { DisplayOptions, Settings } from "../common/apiTypes";
import { IPCError, IPCEvent, SerializedTabBarState, TabID } from "../common/ipcAPI";
import type {
  TabDataUpdate,
  SerializedTab,
  SearchRequest,
  SerializedSettingsTab,
  SettingsTabUpdate,
  SerializedAppTab,
} from "../common/TypesAPI";
import { contextBridge, ipcRenderer } from "electron";
// REMINDER: Handle only takes invokes not sends
console.log("PRELOAD RUNNING...");

contextBridge.exposeInMainWorld("API", {
  appTab: {
    request: (ID: TabID) => ipcRenderer.invoke(IPCEvent.AppRequest, ID),
    onUpdate: (fn: (state: SerializedAppTab) => void) => {
      const handler = (_e: Electron.IpcRendererEvent, state: SerializedAppTab) => fn(state);
      ipcRenderer.on(IPCEvent.AppUpdate, handler);
      return () => ipcRenderer.removeListener(IPCEvent.AppUpdate, handler);
    },
    search: (req: SearchRequest) => ipcRenderer.send(IPCEvent.AppSearch, req),
    setDisplayOptions: (ID: TabID, opts: DisplayOptions) => ipcRenderer.send(IPCEvent.AppSetDisplayOptions, ID, opts),
  },
  settingsTab: {
    request: (ID: TabID) => ipcRenderer.invoke(IPCEvent.SettingsRequest, ID),
    onUpdate: (fn: (state: TabDataUpdate) => void) => {
      const handler = (_e: Electron.IpcRendererEvent, state: SerializedSettingsTab) => fn(state);
      ipcRenderer.on(IPCEvent.SettingsUpdate, handler);
      return () => ipcRenderer.removeListener(IPCEvent.SettingsUpdate, handler);
    },
    // TODO: This should return the main process' settings state
    save: (data: SettingsTabUpdate) => ipcRenderer.invoke(IPCEvent.SettingsSave, data),
    // TODO: This should return the main process' settings state
    reset: () => ipcRenderer.invoke(IPCEvent.SettingsReset),
  },
  startTab: {
    openNew: (ID: TabID) => ipcRenderer.send(IPCEvent.StartOpenNew, ID),
    openFile: (ID: TabID) => ipcRenderer.send(IPCEvent.StartOpenFile, ID),
  },
  tabBar: {
    request: (): Promise<SerializedTabBarState> => ipcRenderer.invoke(IPCEvent.TabRequest),
    onUpdate: (fn: (state: SerializedTabBarState) => void) => {
      const handler = (_e: Electron.IpcRendererEvent, state: SerializedTabBarState) => fn(state);
      ipcRenderer.on(IPCEvent.TabUpdate, handler);
      return () => ipcRenderer.removeListener(IPCEvent.TabUpdate, handler);
    },
    navigateToTab: (ID: TabID) => ipcRenderer.invoke(IPCEvent.TabGo, ID),
    openAndNavigateToTab: () => ipcRenderer.invoke(IPCEvent.TabOpen),
    reorderTabs: (state: SerializedTabBarState) => ipcRenderer.invoke(IPCEvent.TabReorder, state),
    closeTab: (ID: TabID) => ipcRenderer.invoke(IPCEvent.TabClose, ID),
  },
  start: {
    // NOTE: React Router cannot be updated from the component itself. The solution I came up with is:
    // - update the main list
    // - broadcast a tab state update
    // - the handler will renavigate to the start tab (which is now an app tab)
    // - the tab will fetch its data on load
    openNew: (ID: TabID) => ipcRenderer.send(IPCEvent.StartOpenNew, ID),
    openFile: (ID: TabID) => ipcRenderer.send(IPCEvent.StartOpenFile, ID),
  },
  openURL: (addr: string) => ipcRenderer.send(IPCEvent.OpenURL, addr),
  /**Update the `FilterOptions` stored in the main process. */
  displayOptions: {
    request: (): Promise<DisplayOptions> => ipcRenderer.invoke(IPCEvent.AppDisplayRequest),
    apply: (state: DisplayOptions) => ipcRenderer.send(IPCEvent.AppDisplayApply, state),
    onUpdate: (fn: (state: DisplayOptions) => void) => ipcRenderer.on(IPCEvent.AppDisplayUpdate, (_e, state) => fn(state)),
  },
});

contextBridge.exposeInMainWorld("ERROR", {
  log: (log: RendererLog) => ipcRenderer.send(IPCError.Log, log),
  submit: (data: UserErrorInfo) => ipcRenderer.send(IPCError.Submit, data),
});

console.log("PRELOAD FINSHED...");
