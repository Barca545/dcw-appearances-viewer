const { contextBridge, ipcRenderer } = require("electron");
const { initSearch } = require("./init.js");

contextBridge.exposeInMainWorld("darkMode", {
  toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
  system: () => ipcRenderer.invoke("dark-mode:system"),
});

initSearch();
