const { contextBridge, ipcRenderer } = require("electron");

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
      console.log(data);
      return await ipcRenderer.invoke("form-data", data);
    },
  },
  navigate: {
    toPage: (addr) => {
      ipcRenderer.send("navigate", addr);
    },
  },
});
