// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import type { FilterOptions, SearchRequest, Settings } from "../common/apiTypes.js";
import { contextBridge, ipcRenderer } from "electron";

console.log("...PRELOAD RUNNING");

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
    page: (addr: string) => ipcRenderer.send("navigate:page", addr),
    url: (addr: string) => ipcRenderer.send("navigate:URL", addr),
  },
  settings: {
    request: async () => {
      // It is returned as a JSON blob so it needs to be converted
      // const settings = await ipcRenderer.invoke("settings:request");
      return ipcRenderer.invoke("settings:request");
    },
    update: (data: Settings) => ipcRenderer.send("settings:update", data),
  },
  filterOptions: (state: FilterOptions) => {
    // TODO: Can I handle the conversion into the correct format here instead of the functions?
    return ipcRenderer.invoke("filterOptions", state);
  },
  recieveData: (callback: (data: any) => any) => ipcRenderer.on("file-opened", (_event, res) => callback(res)),
});

console.log("...PRELOAD FINSHED");
