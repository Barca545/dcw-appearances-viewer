// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import type { AppPage, FilterOptions, SearchRequest, Settings } from "../common/apiTypes.js";
import { contextBridge, ipcMain, ipcRenderer } from "electron";
// REMINDER: Handle only takes invokes not sends
console.log("PRELOAD RUNNING...");

// TODO: If this ends up being overly granular merge taking inspiration from
// https://stackoverflow.com/questions/66266205/how-to-read-a-local-file-in-javascript-running-from-an-electron-app
contextBridge.exposeInMainWorld("api", {
  // TODO: Confirm These still work
  darkMode: {
    toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
    system: () => ipcRenderer.invoke("dark-mode:system"),
  },
  form: {
    submit: (data: SearchRequest) => {
      // TODO: Can I handle the conversion into the correct format here instead of the functions?
      return ipcRenderer.invoke("form-data", data);
    },
  },
  open: {
    /**Open a Page in the current window. */
    page: (addr: AppPage) => ipcRenderer.send("open:page", addr),
    url: (addr: string) => ipcRenderer.send("open:URL", addr),
  },
  settings: {
    request: async () => {
      // It is returned as an object with the fields of `Settings` but no methods.
      return ipcRenderer.invoke("settings:request");
    },
    /**Save the new settings to the disk. */
    save: (data: Settings) => ipcRenderer.send("settings:save", data),
    /**Request a preview of the settings but do not save them to disk. */
    apply: (data: Settings) => ipcRenderer.send("settings:update", data),
    /**Close the window that sent the request.*/
    close: () => ipcRenderer.send("settings:close"),
  },
  filterOptions: (state: FilterOptions) => {
    // TODO: Can I handle the conversion into the correct format here instead of the functions?
    return ipcRenderer.invoke("filterOptions", state);
  },
  recieveData: (callback: (data: any) => any) => ipcRenderer.on("file-opened", (_event, res) => callback(res)),
  dataRequest: (data: any) =>
    ipcRenderer.on("data:request", () => {
      ipcRenderer.send("data:response", data);
    }),
});

// ipcRenderer.on("data:request", () => {
//   console.log("testing 1");
//   ipcRenderer.send("data:response", "testing 2");
// });

console.log("PRELOAD FINSHED...");
