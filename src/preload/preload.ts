// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// TODO: If this ends up being overly granular merge taking inspiration from
// https://stackoverflow.com/questions/66266205/how-to-read-a-local-file-in-javascript-running-from-an-electron-app
import type { AppPage, FilterDensity, SearchRequest, Settings, FilterOrder, TabData } from "../common/apiTypes.js";
import { contextBridge, ipcRenderer } from "electron";
// REMINDER: Handle only takes invokes not sends
console.log("PRELOAD RUNNING...");

contextBridge.exposeInMainWorld("API", {
  settings: {
    request: async (): Promise<Settings> => ipcRenderer.invoke("settings:request"),
    /**Save the new settings to the disk. */
    save: (data: Settings) => ipcRenderer.send("settings:save", data),
    /**Request a preview of the settings but do not save them to disk. */
    apply: (data: Settings) => ipcRenderer.send("settings:update", data),
  },
  /**Updata data for a tab. */
  update: {
    /**Submits the form to the main process and returns the result to the renderer. */
    request: async (req: SearchRequest): Promise<TabData> => {
      const res = (await ipcRenderer.invoke("update:request", req)) as TabData;
      if (res.meta.success) {
        return res;
      } else {
        return Promise.reject(`Failed to fetch ${res.meta.character}`);
      }
    },
    subscribe: (handler: (res: TabData) => void) => {
      console.log("Registering IPC listener");

      const ref = (_e: Electron.IpcRendererEvent, res: TabData) => {
        console.log("recieving data");
        handler(res);
      };

      ipcRenderer.on("update:emit", ref);

      return () => ipcRenderer.off("update:emit", ref);
    },
    // TODO: Debating if I should do this, it would would but require the exact same function ref be passed to
    // subscribe: (handler: (_e: Electron.IpcRendererEvent, res: TabData) => void) => ipcRenderer.on("update:emit", handler),
    // unsubscribe: (handler: (_e: Electron.IpcRendererEvent, res: TabData) => void) => ipcRenderer.off("update:emit", handler),
  },
  open: {
    /**Open a new AppPage in the current tab. */
    page: (addr: AppPage) => ipcRenderer.send("open:page", addr),
    /**Open a Web URL in the default browser. */
    url: (addr: string) => ipcRenderer.send("open:URL", addr),
    /**Open a project file in the current tab. */
    file: () => ipcRenderer.send("open:file"),
  },
  /**Update the `FilterOptions` stored in the main process. */
  filter: {
    /**Set a new value for the App's filter order. */
    order: (order: FilterOrder) => ipcRenderer.send("filter:order", order),
    /**Set a new value for the App's filter density. */
    density: (density: FilterDensity) => ipcRenderer.send("filter:density", density),
    /**Set a new value for the App's filter ascent direction. */
    ascending: (asc: boolean) => ipcRenderer.send("filter:asc", asc),
  },
});

console.log("PRELOAD FINSHED...");
