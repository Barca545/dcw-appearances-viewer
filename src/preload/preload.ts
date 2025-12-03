// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import type {
  AppPage,
  FilterDensity,
  FilterOptions,
  SearchRequest,
  Settings,
  SortOrder,
  SubmitResponse,
} from "../common/apiTypes.js";
import { contextBridge, ipcRenderer } from "electron";
// REMINDER: Handle only takes invokes not sends
console.log("PRELOAD RUNNING...");

// TODO: If this ends up being overly granular merge taking inspiration from
// https://stackoverflow.com/questions/66266205/how-to-read-a-local-file-in-javascript-running-from-an-electron-app
contextBridge.exposeInMainWorld("api", {
  // TODO: Form is maybe the wrong word
  form: {
    submit: async (req: SearchRequest) => {
      const res = (await ipcRenderer.invoke("form:submit", req)) as SubmitResponse;
      if (res.success) {
        return res;
      } else {
        return Promise.reject(`Failed to fetch ${res.character}`);
      }
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
  // TODO: This could also be under form
  requestReflow: (state: FilterOptions) => {
    // TODO: Can I handle the conversion into the correct format here instead of the functions?
    return ipcRenderer.invoke("filterOptions", state);
  },
  // TODO: Maybe these belong in a subsection
  // TODO: Does this *need* to be a callback instead of just recieving the data
  recieveData: (callback: (data: any) => any) => ipcRenderer.on("data:response", (_event, res) => callback(res)),
  dataRequest: (data: any) => ipcRenderer.on("data:request", () => ipcRenderer.send("data:response", data)),
  displayError: (title: string, error: string) => {
    console.log(title);
    console.log(error);
    ipcRenderer.invoke("error:show", title, error);
  },
  // TODO: Update the filter options held on main
  filter: {
    sortOrder: (order: SortOrder) => {},
    density: (density: FilterDensity) => {},
    ascending: (asc: boolean) => {},
  },
});

console.log("PRELOAD FINSHED...");
