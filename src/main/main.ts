import { app, BrowserWindow, ipcMain, shell } from "electron";
import { nativeTheme } from "electron/main";
import { Sessions } from "./session.js";
import { createCharacterName } from "../common/utils.js";
import { fetchList } from "../../core/fetch.js";
import { AppearanceData } from "../common/apiTypes.js";

let sessions = new Sessions();
export const isMac = process.platform === "darwin";
/** Path to the Application's userdata folder. */
export const __userdata = `${app.getPath("userData")}/DCDB Appearances/`;

// NOTE: This adds a bunch of event listeners to handle stuff over the lifetime of the app
app.whenReady().then(() => init());

/**Create a new instance of the program */
async function init() {
  const session = await sessions.newSession();

  // Activating the app when no windows are available should open a new one.
  // This listener gets added because MAC keeps the app running even when there are no windows
  // so you need to listen for a situation where the app should be active but there are no windows open
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      sessions.newSession();
    }
  });

  ipcMain.on("navigate:page", (_event, cmd) => {
    // FIXME: This is extremely cursed and eventually now this is no longer navigation this whole API will need to be renamed
    if (cmd == "open") {
      const session = sessions.getFocusedSession();
      // TODO: the get focused should happen inside openFile but it needs to be reworked becaue run it's a methon on window not on main
      session.openFile();
    } else {
      session.loadRenderFile(cmd);
    }
  });

  ipcMain.on("navigate:URL", (_e, url) => {
    console.log(url);
    shell.openExternal(url);
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
    // Confirm this actually updates session. I am not positive session is actually a mutable reference
    session.fileData = await fetchList(character);
    // This needs to be here because renderer can't import
    // Send back to the renderer (clientside)
    // TODO: Use an alert to show a proper error for if the name is wrong (basically if fetch comes back empty)

    const res: { appearances: AppearanceData[]; character: string } = {
      appearances: session.fileData,
      character: character,
    };
    return res;
  });

  // TODO: Figure out why it randomly errors sometimes and says the reflow function does not exist
  ipcMain.handle("filterOptions", (_e, options) => {
    // TODO: If I just target the focused I don't see how it could go wrong but maybe there are edge cases where it does?
    const session = sessions.getFocusedSession();
    session.opt = options;
    return session.reflow();
  });

  ipcMain.handle("settings:request", (_e) => {
    const settings = sessions.getSettings();
    return settings;
  });

  ipcMain.on("settings:update", (_e, data) => {
    // TODO: Need update all the windows so they follow the new ones
    sessions.saveSettings(data);
  });

  ipcMain.on("finish", (e, _data) => {
    console.log(e.sender.id);
    sessions.closeSession(e.sender.id);
  });
}

// import { app, BrowserWindow } from 'electron';
// import path from 'node:path';
// import started from 'electron-squirrel-startup';

// // Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (started) {
//   app.quit();
// }

// const createWindow = () => {
//   // Create the browser window.
//   const mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//     },
//   });

//   // and load the index.html of the app.
//   if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
//     mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
//   } else {
//     mainWindow.loadFile(
//       path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
//     );
//   }

//   // Open the DevTools.
//   mainWindow.webContents.openDevTools();
// };

// // This method will be called when Electron has finished
// // initialization and is ready to create browser windows.
// // Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);

// // Quit when all windows are closed, except on macOS. There, it's common
// // for applications and their menu bar to stay active until the user quits
// // explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// app.on('activate', () => {
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//   }
// });

// // In this file you can include the rest of your app's specific main process
// // code. You can also put them in separate files and import them here.
