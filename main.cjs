const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const { nativeTheme } = require("electron/main");
const path = require("node:path");
const { createCharacterName } = require("./init.cjs");
const { fetchList } = require("./target/fetch");
const fs = require("node:fs");
const { FilterOptions } = require("./target/types");
const {
  saveFile,
  openFile,
  reflow,
  Sessions,
} = require("./target/mainProcessFunctions.js");

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
// - Get filename using path.basename

// Declaring all the globals the program will use
// const isMac = process.platform === "darwin";
// TODO: Store them by title
// let windows = new Set();

let sessions = new Sessions();

// // FIXME: These cannot be globals because then every window will share them
// let savePath;
// let fileData;
// let filterOptions = new FilterOptions();

// TODO: Is there a way to watch a file for changes without actually needing to hold edit access?
// let settings = JSON.parse(fs.readFileSync("settings.json"));

// async function newWindow(src = "index.html") {
//   const currentWindow = BrowserWindow.getFocusedWindow();

//   let x, y;
//   if (currentWindow) {
//     const [curX, curY] = currentWindow.getPosition();
//     // TODO: Is hardcoding this number ok?
//     x = curX + 24;
//     y = curY + 24;
//   }

//   // TODO: Find a way to persist the user's desired size across restarts
//   let win = new BrowserWindow({
//     width: settings.size.width,
//     height: settings.size.height,
//     x: x,
//     y: y,
//     webPreferences: {
//       contextIsolation: true,
//       enableRemoteModule: false,
//       nodeIntegration: false,
//       preload: path.join(__dirname, "preload.js"),
//     },
//   });
//   win.loadFile(path.join(__dirname, src));

//   win.webContents.on("did-finish-load", () => {
//     if (!win) {
//       throw new Error('"win" is not defined');
//     }

//     if (process.env.START_MINIMIZED) {
//       win.minimize();
//     } else {
//       win.show();
//       win.focus();
//     }
//   });

//   // This destroys the window instance
//   win.on("closed", () => {
//     windows.delete(win);
//     win = null;
//   });

//   win.setMenu(menu);
//   return win;
// }

// // FIXME: Do I have to do anything if I want this to have a different/no menu?
// async function newChildWindow(parent, src, modal = false) {
//   let child = new BrowserWindow({
//     width: parent.getSize()[0] / 2,
//     height: parent.getSize()[0] / 2,
//     parent: parent,
//     modal: modal,
//     webPreferences: {
//       contextIsolation: true,
//       enableRemoteModule: false,
//       nodeIntegration: false,
//       preload: path.join(__dirname, "preload.js"),
//     },
//   });
//   child.loadFile(path.join(__dirname, src));
//   child.setMenu(null);
// }

// NOTE: This adds a bunch of event listeners to handle stuff over the lifetime of the app
app.whenReady().then(() => init());

/**Create a new instance of the program */
async function init() {
  const session = await sessions.newSession();

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
    // If I just target the focused I don't see how it could go wrong but maybe there are edge cases where it does?
    const session = sessions.focused.unwrap();
    console.log(session);
    filterOptions = options;
    fileData = reflow(fileData, filterOptions);
    return fileData;
  });
}

// const menu = Menu.buildFromTemplate([
//   ...(isMac ? [{ role: "appMenu" }] : []),
//   {
//     label: "File",
//     submenu: [
//       {
//         label: "New",
//         accelerator: "CommandOrControl+N",
//         click: () =>
//           BrowserWindow.getFocusedWindow().loadFile(
//             path.join(__dirname, "application.html")
//           ),
//       },
//       // TODO: This needs to open the file manager
//       {
//         label: "Open File",
//         accelerator: "CommandOrControl+O",
//         click: () => {
//           openFile(BrowserWindow.getFocusedWindow());
//           console.log(fileData);
//         },
//       },
//       // TODO: Is this needed given the other 3 options will create a new window?
//       { label: "New Window", click: () => newWindow() },
//       { type: "separator" },
//       {
//         label: "Save",
//         accelerator: "CommandOrControl+S",
//         click: () => saveFile(win),
//       },
//       {
//         label: "Save As",
//         click: () => saveFile(BrowserWindow.getFocusedWindow(), true),
//       },
//       { type: "separator" },
//       {
//         label: "Settings",
//         // Settings can launch a new window which is how MS word handles it
//         click: () =>
//           newChildWindow(
//             BrowserWindow.getFocusedWindow(),
//             "settings.html",
//             true
//           ),
//       },
//       { type: "separator" },
//       isMac ? { role: "close" } : { role: "quit" },
//     ],
//   },
//   { role: "editMenu" },
//   { role: "viewMenu" },
// ]);
