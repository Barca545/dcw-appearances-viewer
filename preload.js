const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("darkMode", {
  toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
  system: () => ipcRenderer.invoke("dark-mode:system"),
});

contextBridge.exposeInMainWorld("form", {
  submit: async (data) => {
    return await ipcRenderer.invoke("form-data", data);
  },
});
