const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron");
const { nativeTheme } = require("electron/main");
const path = require("node:path");
const { createCharacterName } = require("./init.cjs");
const { fetchList } = require("./target/fetch");
const { loadList } = require("./target/load");
const fs = require("node:fs");

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

const isMac = process.platform === "darwin";

// TODO: Should this just be an array?
let windows = new Set();
// TODO: It'd be nice if I could set it up so the file name became the window's title but it's not urgent
let save_path;

let fileData;

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

  // TODO: Building the menu can be done in the window creation process apparently
  // TODO: There might be a way to generate this programatically
  // FIXME: Unsure if this way of creating the menu is bad. Other sources seem to just use one menu and  have it just act on the focused window
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
    console.log(character);
    // This needs to be here because renderer can't import
    // Send back to the renderer (clientside)
    // TODO: Use an alert to show a proper error for if the name is wrong (basically if fetch comes back empty)
    return await fetchList(character);
  });

  windows.add(win);
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

  // TODO: This needs to fetch data from the other document and convert it to a text list
  // It's possible it should also store metadata for reloading a session
  // This lets me run JS renderer side. So I need to define a function to get the data and then call it here
  // TODO: Now that I want to move all the data stuff to this end this becomes unnessecary
  fileData = win.webContents.executeJavaScript(`console.log("Hello World!")`);
  try {
    fs.writeFileSync(`${save_path}.txt`, fileData, "utf-8");
  } catch (_err) {
    win.webContents.executeJavaScript(
      `window.alert("Failed to save the file !")`
    );
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

  const list = loadList(res.filePaths[0]);
  // TODO: Set the server side list to list before yeeting it back over.
  fileData = list;
  win.webContents.send();

  // TODO: Need to find a way to serialize and deserialize these results. (probably literally just a JSON)
}
