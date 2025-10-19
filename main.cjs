const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const { nativeTheme } = require("electron/main");
const path = require("node:path");
const { createCharacterName } = require("./init.cjs");
const { fetchList } = require("./target/fetch");

// FIXME: Need to clean main up and create submodules, in general need to organize project
// TODO: newWindow should create entirely separate windows
// Child should be dependent

const isMac = process.platform === "darwin";

let win;

async function newWindow(src = "index1.html") {
  win = new BrowserWindow({
    // TODO: Find a way to persist the user's desired size across size
    width: win ? win.width : 800,
    height: win ? win.height : 600,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.loadFile(path.join(__dirname, src));
}

// FIXME: Do I have to do anything if I want this to have a different/no menu?
async function newChildWindow(parent, src, modal = false) {
  win = new BrowserWindow({
    // TODO: Find a way to persist the user's desired size across size
    width: win ? win.width : 800,
    height: win ? win.height : 600,
    parent: parent,
    modal: modal,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.loadFile(path.join(__dirname, src));
}

// TODO: There might be a way to generate this programatically
const menu = Menu.buildFromTemplate([
  ...(isMac ? [{ role: "appMenu" }] : []),
  {
    label: "File",
    submenu: [
      { label: "New" },
      // TODO: This needs to open the file manager
      { label: "New From File" },
      { label: "Open File" },
      // TODO: Is this needed given the other 3 options will create a new window?
      { label: "New Window" },
      { type: "separator" },
      { label: "Save" },
      // TODO: This needs to open the file manager to save and stuff
      { label: "Save As" },
      { type: "separator" },
      isMac ? { role: "close" } : { role: "quit" },
    ],
  },
  { role: "editMenu" },
  { role: "viewMenu" },
  {
    label: "Settings",
    // Settings can launch a new window which is how MS word handles it
    click: () => newChildWindow(win, "settings.html", true),
  },
]);

// NOTE: This adds a bunch of event listeners to handle stuff over the lifetime of the app
app.whenReady().then(() => {
  newWindow();

  // Activating the app when no windows are available should open a new one.
  // This listener gets added because MAC keeps the app running even when there are no windows
  // so you need to listen for a situation where the app should be active but there are no windows open
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) newWindow();
  });
});

Menu.setApplicationMenu(menu);

ipcMain.on("navigate", (_event, page) => {
  console.log(page);
  win.loadFile(path.join(__dirname, page));
});

// Quit the application when all windows/tabs are closed
ipcMain.on("window-all-closed", () => {
  if (!isMac) app.quit();
});

// FIXME: These be different in a different file

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

ipcMain.handle("form-data", async (_, data) => {
  const character = createCharacterName(data);
  // This needs to be here because renderer can't import
  // Send back to the renderer (clientside)
  // TODO: Need a proper error for if the name is wrong
  return await fetchList(character);
});
