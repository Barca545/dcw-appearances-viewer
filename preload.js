const { contextBridge, ipcRenderer, ipcMain } = require("electron");

// // TODO: It is possible this can all get merged under one api at some point
// // TODO: Why do the channels matter?
// contextBridge.exposeInMainWorld("darkMode", {
//   toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
//   system: () => ipcRenderer.invoke("dark-mode:system"),
// });

// contextBridge.exposeInMainWorld("form", {
//   submit: async (data) => {
//     return await ipcRenderer.invoke("form-data", data);
//   },
// });

// contextBridge.exposeInMainWorld("navigate", {
//   toPage: (addr) => {
//     console.log(addr);
//     ipcRenderer.send("navigate", addr);
//   },
// });

// TODO: If this ends up being overly granular merge taking inspiration from
// https://stackoverflow.com/questions/66266205/how-to-read-a-local-file-in-javascript-running-from-an-electron-app
contextBridge.exposeInMainWorld("api", {
  // TODO: Confirm These still
  darkMode: {
    toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
    system: () => ipcRenderer.invoke("dark-mode:system"),
  },
  form: {
    submit: async (data) => {
      return await ipcRenderer.invoke("form-data", data);
    },
  },
  navigate: {
    toPage: (addr) => {
      console.log(addr);
      ipcRenderer.send("navigate", addr);
    },
  },
});
