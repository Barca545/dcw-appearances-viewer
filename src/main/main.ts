import { app, BrowserWindow, ipcMain, shell } from "electron";
import { nativeTheme } from "electron/main";
import path from "node:path";
import { Sessions } from "./mainProcessFunctions.js";
import { createCharacterName } from "../common/init.js";
import { fetchList } from "../common/fetch.js";
import fs from "fs";
import { Settings } from "../common/apiTypes.js";

// TODO: View needs to not show dev stuff when packaged
// TODO: Toggles should use sliders https://www.w3schools.com/howto/howto_css_switch.asp
// TODO: Could stand to be a *bit* prettier
// TODO: Hot reloading does not work for ts because it does not recompile
// FIXME: Need to clean main up and create submodules, in general need to organize project
//   - A lot of the logic files can go in main
//   - This is as good an outline as any https://webpack.electron.build/project-structure
// TODO: All of the isMac stuff should be something that can be handled during compilation
// TODO: Confirm sessions supports multiple sessions at once
// FIXME: Probably worth it to switch to react for later versions since it is easier to handle the kind of reactive changes I want to do
// TODO: If the session it is being issued from is already active openFile should create a new window (well follow those settings) not overwrite the current session
// TODO: Save to markdown reading list that formats each entry as "-[] [name](link)\n"
// TODO: Tests will have to get completely reworked now the file structure changed

// Urgent Pre-alpha
// TODO: Actually implement settings file
// TODO: Figure out where settings needs to go for bundling
// TODO: Be cool if the lists could be saved
// TODO: Store the name of the character as part of the session/save data so it can be used to show who the appearances belong to
// TODO: Renderer files for the start and settings pages are not compiling

let sessions = new Sessions();
export const isMac = process.platform === "darwin";
const __userdata = app.getPath("userData");

// NOTE: This adds a bunch of event listeners to handle stuff over the lifetime of the app
app.whenReady().then(() => init());

/**Create a new instance of the program */
async function init() {
  const session = await sessions.newSession();
  let win = session.win;

  // Activating the app when no windows are available should open a new one.
  // This listener gets added because MAC keeps the app running even when there are no windows
  // so you need to listen for a situation where the app should be active but there are no windows open
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      sessions.newWindow();
    }
  });

  ipcMain.on("navigate:page", (_event, page) => {
    // FIXME: This is extremely cursed and eventually now this is no longer navigation this whole API will need to be renamed
    if (page == "open.html") {
      const session = sessions.getFocusedSession();
      session.openFile();
    } else {
      win.loadFile(path.join(process.cwd(), page));
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
    return { appearances: session.fileData, character: character };
  });

  // TODO: Figure out why it randomly errors sometimes and says the reflow function does not exist
  ipcMain.handle("filterOptions", (_e, options) => {
    // TODO: If I just target the focused I don't see how it could go wrong but maybe there are edge cases where it does?
    const session = sessions.getFocusedSession();
    session.opt = options;
    return session.reflow();
  });

  ipcMain.handle("settings:request", (_e) => {
    // @ts-ignore
    return JSON.parse(fs.readFileSync(`${__userdata}/DCDB Appearances/settings.json`)) as Settings;
  });

  ipcMain.handle("settings:update", (_e, data) => {
    console.log(data);
  });
}
