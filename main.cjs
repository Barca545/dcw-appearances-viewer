const { app, BrowserWindow, ipcMain } = require("electron");
const { nativeTheme } = require("electron/main");
const path = require("node:path");
const { createCharacterName } = require("./init.cjs");
const { fetchList } = require("./target/fetch");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  win.loadFile("index.html");
};

// TODO: What is an ipcmain
// Control behavior when dark mode is toggled
ipcMain.handle("dark-mode:toggle", () => {
  // If dark mode is toggled and we're in dark mode, switch to light
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = "light";
  } else {
    // If dark mode is toggled and we're in light mode, switch to dark
    nativeTheme.themeSource = "dark";
  }

  return nativeTheme.shouldUseDarkColors;
});

ipcMain.handle("dark-mode:system", () => {
  nativeTheme.themeSource = "system";
});

ipcMain.handle("form-data", async (e, data) => {
  const character = createCharacterName(data);
  // This needs to be here because renderer can't import
  // Send back to the renderer (clientside)
  // TODO: Need a proper error for if the name is wrong
  return await fetchList(character);
});

// Activate the app when no windows are available should open a new one.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit the application when all windows/tabs are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
