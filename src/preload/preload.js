// import type { FilterOptions, SearchRequest, Settings } from "../common/apiTypes.js";
// import { contextBridge, ipcRenderer } from "electron";

// // TODO: If this ends up being overly granular merge taking inspiration from
// // https://stackoverflow.com/questions/66266205/how-to-read-a-local-file-in-javascript-running-from-an-electron-app
// contextBridge.exposeInMainWorld("api", {
//   // TODO: Confirm These still work
//   darkMode: {
//     toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
//     system: () => ipcRenderer.invoke("dark-mode:system"),
//   },
//   form: {
//     submit: (data: SearchRequest) => {
//       // TODO: Can I handle the conversion into the correct format here instead of the functions?
//       return ipcRenderer.invoke("form-data", data);
//     },
//   },
//   open: {
//     page: (addr: string) => ipcRenderer.send("navigate:page", addr),
//     url: (addr: string) => ipcRenderer.send("navigate:URL", addr),
//   },
//   settings: {
//     request: () => {
//       return ipcRenderer.invoke("settings:request");
//     },
//     update: (data: Settings) => {
//       ipcRenderer.send("settings:update", data);
//     },
//   },
//   filterOptions: (state: FilterOptions) => {
//     // TODO: Can I handle the conversion into the correct format here instead of the functions?
//     return ipcRenderer.invoke("filterOptions", state);
//   },
//   recieveData: (callback: (data: any) => any) => ipcRenderer.on("file-opened", (_event, res) => callback(res)),
// });

const { contextBridge, ipcRenderer } = require("electron");

// TODO: If this ends up being overly granular merge taking inspiration from
// https://stackoverflow.com/questions/66266205/how-to-read-a-local-file-in-javascript-running-from-an-electron-app
contextBridge.exposeInMainWorld("api", {
  // TODO: Confirm These still work
  darkMode: {
    toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
    system: () => ipcRenderer.invoke("dark-mode:system"),
  },
  form: {
    submit: (data) => {
      // TODO: Can I handle the conversion into the correct format here instead of the functions?
      return ipcRenderer.invoke("form-data", data);
    },
  },
  // TODO: Maybe change this to command since now open isn't a navigation thing
  // So the call path would be api.open.page() and api.open.url()
  open: {
    page: (addr) => ipcRenderer.send("navigate:page", addr),
    url: (addr) => ipcRenderer.send("navigate:URL", addr),
  },
  settings: {
    request: () => {
      return ipcRenderer.invoke("settings:request");
    },
    update: (data) => {
      ipcRenderer.send("settings:update", data);
    },
  },
  // I believe this is just a call to send data over to main to be filtered and the recieve the filtered data
  filterOptions: (state) => {
    // TODO: Can I handle the conversion into the correct format here instead of the functions?
    return ipcRenderer.invoke("filterOptions", state);
  },
  recieveData: (callback) => ipcRenderer.on("file-opened", (_event, res) => callback(res)),
});
