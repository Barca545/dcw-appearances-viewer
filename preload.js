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
    submit: (data) => {
      console.log(data);
      return ipcRenderer.invoke("form-data", data);
    },
  },
  navigate: {
    toPage: (addr) => {
      ipcRenderer.send("navigate", addr);
    },
  },
  // I believe this is just a call to send data over to main to be filtered and the recieve the filtered data
  filterOptions: (state) => {
    return ipcRenderer.invoke("filterOptions", state);
  },
  recieveData: (callback) =>
    ipcRenderer.on("file-opened", (_event, res) => callback(res)),
});
