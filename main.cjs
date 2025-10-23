const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron");
const { nativeTheme } = require("electron/main");
const path = require("node:path");
const { createCharacterName } = require("./init.cjs");
const { fetchList } = require("./target/fetch");
const { loadList } = require("./target/load");
const fs = require("node:fs");
const { FilterOptions } = require("./target/types");
const {
  createResultsList,
  createDenseResultsList,
} = require("./target/elements.js");
const { pubDateSort } = require("./target/pub-sort");

// TODO: Do the list creation and manipulation "serverside" and display the results on the renderer.
// A little bit more awkward to pass the button presses back and forth but ultimately makes saving more reliable.
// Also removes the need to store as much clientside
// TODO: Add open files
// TODO: Add undo, redo
// TODO: View needs to not show dev stuff when packaged
// TODO: Toggles should use sliders https://www.w3schools.com/howto/howto_css_switch.asp
// TODO: Be cool if the lists could be saved
// TODO: The titles should be hyperlinks
// TODO: Could stand to be a *bit* prettier
// TODO: Hot reloading? during dev works but not for ts because it does not recompile
// TODO: Show the name of the character above the results
// TODO: Support for multiple tabs
// FIXME: Need to clean main up and create submodules, in general need to organize project
// FIXME: Keep the data serverside not clientside
// TODO: When I move reorganize I should make as much as possible TS files
// TODO: It'd be nice if I could set it up so the file name became the window's title but it's not urgent
// TODO: Landing page buttons broke

// Declaring all the globals the program will use
const isMac = process.platform === "darwin";
let windows = new Set();

let savePath;
let fileData;
let filterOptions = new FilterOptions();

// TODO: Is there a way to watch a file for changes without actually needing to hold edit access?
let settings = JSON.parse(fs.readFileSync("settings.json"));

async function newWindow(src = "index1.html") {
  const currentWindow = BrowserWindow.getFocusedWindow();

  let x, y;
  if (currentWindow) {
    const [curX, curY] = currentWindow.getPosition();
    // TODO: Is hardcoding this number ok?
    x = curX + 24;
    y = curY + 24;
  }

  // TODO: Find a way to persist the user's desired size across restarts
  let win = new BrowserWindow({
    width: settings.size.width,
    height: settings.size.height,
    x: x,
    y: y,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.loadFile(path.join(__dirname, src));

  win.webContents.on("did-finish-load", () => {
    if (!win) {
      throw new Error('"win" is not defined');
    }

    if (process.env.START_MINIMIZED) {
      win.minimize();
    } else {
      win.show();
      win.focus();
    }
  });

  // This destroys the window instance
  win.on("closed", () => {
    windows.delete(win);
    win = null;
  });

  // FIXME: Unsure if this way of creating the menu is bad. Other sources seem to just use one menu and  have it just act on the focused window
  const menu = Menu.buildFromTemplate([
    ...(isMac ? [{ role: "appMenu" }] : []),
    {
      label: "File",
      submenu: [
        {
          label: "New",
          accelerator: "CommandOrControl+N",
          click: () => win.loadFile(path.join(__dirname, "application.html")),
        },
        // TODO: This needs to open the file manager
        {
          label: "Open File",
          accelerator: "CommandOrControl+O",
          click: () => openFile(),
        },
        // TODO: Is this needed given the other 3 options will create a new window?
        { label: "New Window", click: () => newWindow() },
        { type: "separator" },
        {
          label: "Save",
          accelerator: "CommandOrControl+S",
          click: () => saveFile(win),
        },
        { label: "Save As", click: () => saveFile(win, true) },
        { type: "separator" },
        {
          label: "Settings",
          // Settings can launch a new window which is how MS word handles it
          click: () => newChildWindow(win, "settings.html", true),
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },
    { role: "editMenu" },
    { role: "viewMenu" },
  ]);
  win.setMenu(menu);
  return win;
}

// FIXME: Do I have to do anything if I want this to have a different/no menu?
async function newChildWindow(parent, src, modal = false) {
  let child = new BrowserWindow({
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
async function init() {
  // TODO: This will eventually need to pull from the settings
  let win = await newWindow();

  // Activating the app when no windows are available should open a new one.
  // This listener gets added because MAC keeps the app running even when there are no windows
  // so you need to listen for a situation where the app should be active but there are no windows open
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) newWindow();
  });

  ipcMain.on("navigate", (_event, page) => {
    win.loadFile(path.join(__dirname, page));
  });

  // Quit the application when all windows/tabs are closed
  ipcMain.on("window-all-closed", () => {
    if (!isMac) app.quit();
  });

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
    fileData = await fetchList(character);
    // This needs to be here because renderer can't import
    // Send back to the renderer (clientside)
    // TODO: Use an alert to show a proper error for if the name is wrong (basically if fetch comes back empty)
    return fileData;
  });

  ipcMain.handle("filterOptions", (_, options) => {
    filterOptions = options;
    fileData = reflow(fileData);
    return fileData;
  });

  windows.add(win);
}

async function saveFile(win, saveas) {
  // If there is no save_path set one or if this is explicitly a save as command
  if (saveas || typeof savePath === "undefined" || savePath === null) {
    const res = await dialog.showSaveDialog({
      defaultPath: __dirname,
      // FIXME: Can't be this and openFile figure out the difference
      properties: ["openDirectory"],
      filters: [{ name: ".txt", extensions: ["txt"] }],
    });

    // Early return if the user cancels
    if (res.canceled || !res.filePath) return;

    savePath = res.filePath;
  }

  // It's possible it should also store metadata for reloading a session
  // TODO: Possible I might need to figure out the extensions
  try {
    fs.writeFileSync(`${savePath}`, JSON.stringify(fileData), "utf-8");
  } catch (_err) {
    win.webContents.executeJavaScript(`window.alert("Failed to save file!")`);
  }
}

async function openFile() {
  const res = await dialog.showOpenDialog({
    defaultPath: __dirname,
    filters: [{ name: ".txt", extensions: ["txt"] }],
  });

  // If the action was canceled, abort and return early
  // FIXME: Need better error for if the file cannot open
  if (res.canceled || !res.filePath) return;

  // Update the save path to match the path of the current file
  savePath = res.filePaths[0];

  const list = loadList(savePath);

  // TODO: Set the server side list to list before yeeting it back over.
  fileData = reflow(list);

  // Reflow the list if necessary

  win.webContents.send();

  // TODO: Need to find a way to serialize and deserialize these results. (probably literally just a JSON)
}

/**Recalculate the layout of the results section.*/
function reflow(list) {
  let sorted = list;
  // TODO: Basically move all this logic serverside
  switch (filterOptions.sortOrder) {
    case "PUB": {
      sorted = pubDateSort(list);
      break;
    }
    case "A-Z": {
      // TODO: This type of sorting needs to be checked for correctness
      sorted = sorted.sort((a, b) => {
        if (a.title < b.title) {
          return -1;
        }
        if (a.title > b.title) {
          return 1;
        }
        return 0;
      });
      break;
    }
  }

  // Make sure it does ascendingdescending
  if (!filterOptions.ascending) {
    sorted = sorted.reverse();
  }

  return sorted;
}
