// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import type { AppPage, FilterOptions, SearchRequest, Settings } from "../common/apiTypes.js";
import { contextBridge, ipcRenderer } from "electron";
// REMINDER: Handle only takes invokes not sends
console.log("PRELOAD RUNNING...");

// TODO: If this ends up being overly granular merge taking inspiration from
// https://stackoverflow.com/questions/66266205/how-to-read-a-local-file-in-javascript-running-from-an-electron-app
contextBridge.exposeInMainWorld("api", {
  form: {
    submit: (data: SearchRequest) => {
      // TODO: Can I handle the conversion into the correct format here instead of the functions?
      return ipcRenderer.invoke("form:submit", data);
    },
  },
  open: {
    /**Open a Page in the current window. */
    page: (addr: AppPage) => ipcRenderer.send("open:page", addr),
    url: (addr: string) => ipcRenderer.send("open:URL", addr),
    file: () => ipcRenderer.send("open:file"),
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
    // FIXME: This is no longer needed becaues now it is simply a tag so close behavior will be shared
    close: () => ipcRenderer.send("settings:close"),
  },
  // TODO: This could be renamed "requestReflow"
  filterOptions: (state: FilterOptions) => {
    // TODO: Can I handle the conversion into the correct format here instead of the functions?
    return ipcRenderer.invoke("filterOptions", state);
  },
  // TODO: Maybe these belong in a subsection
  // TODO: Does this *need* to be a callback instead of just recieving the data
  recieveData: (callback: (data: any) => any) => ipcRenderer.on("data:response", (_event, res) => callback(res)),
  dataRequest: (data: any) => ipcRenderer.on("data:request", () => ipcRenderer.send("data:response", data)),
});

console.log("PRELOAD FINSHED...");
