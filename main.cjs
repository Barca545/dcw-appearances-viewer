const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron");
const { nativeTheme } = require("electron/main");
const path = require("node:path");
const { createCharacterName } = require("./init.cjs");
const { fetchList } = require("./target/fetch");
const fs = require("node:fs");

// TODO: Do the list creation and manipulation "serverside" and display the results on the renderer.
// A little bit more awkward to pass the button presses back and forth but ultimately makes saving more reliable.
// Also removes the need to store as much clientside

// FIXME: Need to clean main up and create submodules, in general need to organize project
// Windows should probably have a minimum size

const isMac = process.platform === "darwin";

let windows = new Set();
// TODO: It'd be nice if I could set it up so the file name became the window's title but it's not urgent
let save_path;

let file_data = "";

// FIXME: For some reason this does not make a window independent of other windows.
// It the windows seem to share control
async function newWindow(src = "index1.html") {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.loadFile(path.join(__dirname, src));

  // TODO: Building the menu can be done in the window creation process apparently
  // TODO: There might be a way to generate this programatically
  const menu = Menu.buildFromTemplate([
    ...(isMac ? [{ role: "appMenu" }] : []),
    {
      label: "File",
      submenu: [
        {
          label: "New",
          click: () => win.loadFile(path.join(__dirname, "application.html")),
        },
        // TODO: This needs to open the file manager
        { label: "Open File" },
        // TODO: Is this needed given the other 3 options will create a new window?
        { label: "New Window", click: () => newWindow() },
        { type: "separator" },
        {
          label: "Save",
          accelerator: "CommandOrControl+S",
          click: () => saveFile(win),
        },
        // TODO: This needs to open the file manager to save and stuff
        { label: "Save As", click: () => saveFile(win, true) },
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
  win.setMenu(menu);

  return win;
}

// FIXME: Do I have to do anything if I want this to have a different/no menu?
async function newChildWindow(parent, src, modal = false) {
  let child = new BrowserWindow({
    // TODO: Find a way to persist the user's desired size across size
    width: parent.getSize()[0] / 2,
    height: parent.getSize()[0] / 2,
    parent: parent,
    modal: modal,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  child.loadFile(path.join(__dirname, src));
  child.setMenu(null);
}

// NOTE: This adds a bunch of event listeners to handle stuff over the lifetime of the app
app.whenReady().then(() => init());

/**Create a new instance of the program */
function init() {
  // TODO: This will eventually need to pull from the settings
  windows.add(newWindow());

  // Activating the app when no windows are available should open a new one.
  // This listener gets added because MAC keeps the app running even when there are no windows
  // so you need to listen for a situation where the app should be active but there are no windows open
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) newWindow();
  });
}

async function saveFile(win, saveas) {
  // If there is no save_path set one or if this is explicitly a save as command
  if (saveas || typeof save_path === "undefined" || save_path === null) {
    const res = await dialog.showSaveDialog({
      defaultPath: __dirname,
      // FIXME: Can't be this and openFile figure out the difference
      properties: ["openDirectory"],
      filters: [{ name: ".txt", extensions: ["txt"] }],
    });

    // Early return if the user cancels
    if (res.canceled || !res.filePath) return;

    save_path = res.filePath;
  }

  console.log(save_path);

  // TODO: This needs to fetch data from the other document and convert it to a text list
  // It's possible it should also store metadata for reloading a session
  // This lets me run JS renderer side. So I need to define a function to get the data and then call it here
  file_data = win.webContents.executeJavaScript(`console.log("Hello World!")`);
  try {
    fs.writeFileSync(`${save_path}.txt`, file_data, "utf-8");
  } catch (_err) {
    win.webContents.executeJavaScript(
      `window.alert("Failed to save the file !")`
    );
  }
}

ipcMain.on("navigate", (_event, page) => {
  win.loadFile(path.join(__dirname, page));
});

// Quit the application when all windows/tabs are closed
ipcMain.on("window-all-closed", () => {
  if (!isMac) app.quit();
});

// FIXME: These should be different in a different file

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

// TODO: If I handle
ipcMain.handle("form-data", async (_, data) => {
  const character = createCharacterName(data);
  // This needs to be here because renderer can't import
  // Send back to the renderer (clientside)
  // TODO: Use an alert to show a proper error for if the name is wrong
  return await fetchList(character);
});
