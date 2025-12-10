// TODO: If this ends up being overly granular merge taking inspiration from
// https://stackoverflow.com/a/66270356/24660323
import type { TabData, TabID, SearchRequest, SerializedAppTab } from "../common/TypesAPI";
import type { DisplayDensity, Settings, DisplayOrder, DisplayDirection } from "../common/apiTypes";
import { contextBridge, ipcRenderer } from "electron";
import { APIEvent } from "../common/ipcAPI";
// REMINDER: Handle only takes invokes not sends
console.log("PRELOAD RUNNING...");

// TODO: Does this have to be in the file where it's used
/**A [typeguard](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) for checking whether TabData is `SerializedAppTab`.*/
function isSerializedAppTab(data: TabData): data is SerializedAppTab {
  return (data as SerializedAppTab) != undefined;
}

contextBridge.exposeInMainWorld("API", {
  settings: {
    request: async (): Promise<Settings> => ipcRenderer.invoke(APIEvent.SettingsRequest),
    /**Save the new settings to the disk. */
    save: (data: Settings) => ipcRenderer.send(APIEvent.SettingsSave, data),
    /**Request a preview of the settings but do not save them to disk. */
    apply: (data: Settings) => ipcRenderer.send(APIEvent.SettingsApply, data),
  },
  /**Updata data for a tab. */
  tab: {
    /**Submits the form to the main process and returns the result to the renderer. */
    request: async (req: SearchRequest): Promise<TabData> => {
      const res = (await ipcRenderer.invoke(APIEvent.TabRequest, req)) as TabData;
      if (res.success) {
        return res;
      } else if (isSerializedAppTab(res)) {
        return Promise.reject(`Failed to fetch ${res.meta.characterName}`);
      } else {
        return Promise.reject("Failed to fetch settings.");
      }
    },
    update: (fn: (res: TabData) => void) => {
      const ref = (_e: Electron.IpcRendererEvent, res: TabData) => fn(res);

      ipcRenderer.on(APIEvent.TabUpdate, ref);

      return () => ipcRenderer.off(APIEvent.TabUpdate, ref);
    },
    /** Process request from the main process to navigate to a new project tab.
     *
     * **NOTE**: Does not update the tab. Updating must be handled separately.*/
    go: (fn: (id: TabID) => void) => ipcRenderer.on(APIEvent.TabGo, (_e, id: TabID) => fn(id)),
    close: (fn: (ID: TabID) => void) => ipcRenderer.on(APIEvent.TabClose, (_e, ID) => fn(ID)),
    // TODO: Debating if I should do this, it would would but require the exact same function ref be passed to both
    // subscribe: (handler: (_e: Electron.IpcRendererEvent, res: TabData) => void) => ipcRenderer.on("update:emit", handler),
    // unsubscribe: (handler: (_e: Electron.IpcRendererEvent, res: TabData) => void) => ipcRenderer.off("update:emit", handler),
  },
  open: {
    /**Open a new tab. Returns the tab's data.*/
    page: () => ipcRenderer.invoke(APIEvent.OpenPage),
    /**Open a project file in the current tab. Returns the tab's data. */
    file: () => ipcRenderer.invoke(APIEvent.OpenFile),
    /**Open a Web URL in the default browser. */
    url: (addr: string) => ipcRenderer.send(APIEvent.OpenURL, addr),
  },
  /**Update the `FilterOptions` stored in the main process. */
  filter: {
    /**Set a new value for the App's filter order. */
    order: (order: DisplayOrder) => ipcRenderer.send(APIEvent.FilterOrder, order),
    /**Set a new value for the App's filter density. */
    density: (density: DisplayDensity) => ipcRenderer.send(APIEvent.FilterDensity, density),
    /**Set a new value for the App's filter ascent direction. */
    ascending: (asc: DisplayDirection) => ipcRenderer.send(APIEvent.FilterAsc, asc),
  },
});

console.log("PRELOAD FINSHED...");
