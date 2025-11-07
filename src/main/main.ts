import { app, ipcMain, shell } from "electron";
import { Session } from "./session";
import { createCharacterName } from "../common/utils";
import { fetchList } from "../../core/fetch.js";
import { AppearanceData } from "../common/apiTypes";
import { IS_MAC } from "./helpers";

// TODO: I am not actually sure if holding the session here at the top level after init is needed
// It would be in rust but it's possible that is not the case in JS
let session: Session;
app.whenReady().then(() => init());

// NOTE: This adds a bunch of listeners to the main process it needs to function

// Ok general outline of my plan:
// - Tabs akin to what VS Code has
// - Opening some things (like settings and new tab) automatically open a new tab
// - User can manually open a new tab too
// - Configurable on tab close behavior

/**Revister `IPC` event handlers for communication between the renderer and main process*/
// FIXME: Should this be a method on session?
async function init() {
  // FIXME: Fix MAC behavior, really I want to just make it so that closing the window closes the app
  // damn expected MAC behavior

  // Activating the app when no windows are available should open a new one.
  // This listener gets added because MAC keeps the app running even when there are no windows
  // so you need to listen for a situation where the app should be active but there are no windows open
  // app.on("activate", () => {
  //   if (BrowserWindow.getAllWindows().length === 0) {
  //     sessions.newSession();
  //   }
  // });

  // This must be created after the app is ready
  session = new Session(async () => {});

  // NAVIGATION LISTENERS

  // FIXME: This needs to get split into navigate:page and navigate:file
  ipcMain.on("open:page", (_e, page) => session.openAppPage(page));
  // TODO: Arguably the internal open dialog should occur out here.
  // Open file should possibly be more general and just take a filepath
  ipcMain.on("open:file", (_e, _page) => session.openFile());
  ipcMain.on("open:URL", (_e, url) => shell.openExternal(url));

  // Quit the application when all windows/tabs are closed
  ipcMain.on("window-all-closed", (_e) => {
    if (!IS_MAC) app.quit();
  });

  ipcMain.handle("form:submit", async (_e, data) => {
    const character = createCharacterName(data);
    // Confirm this actually updates session. I am not positive session is actually a mutable reference
    session.projectData.meta.character = character;
    session.projectData.data = await fetchList(character);
    // This needs to be here because renderer can't import
    // Send back to the renderer (clientside)
    // TODO: Use an alert to show a proper error for if the name is wrong (basically if fetch comes back empty)

    const res: { appearances: AppearanceData[]; character: string } = {
      appearances: session.projectData.data,
      character: character,
    };

    console.log(session.projectData.data);
    return res;
  });

  // TODO: Figure out why it randomly errors sometimes and says the reflow function does not exist
  ipcMain.handle("filterOptions", (_e, options) => {
    // TODO: If I just target the focused I don't see how it could go wrong but maybe there are edge cases where it does?
    session.opt = options;
    return session.reflow();
  });

  // SETTINGS LISTENERS

  ipcMain.handle("settings:request", (_e) => {
    return session.settings;
  });

  ipcMain.on("settings:update", (_e, settings) => {
    // TODO: Need update all the windows so they follow the new ones
    // Just apply no save
    session.applySettings(settings);
  });

  // FIXME: All the setting save logic is still kind of broken
  ipcMain.on("settings:save", (_e, settings) => {
    // Update settings
    session.updateSettings(settings);

    // Save settings
    session.saveSettings();
  });

  // This is a listener for a generic submission of data from the frontend
  // Don't love this will probably ditch it
  ipcMain.on("data:response", (_e, data) => {
    console.log(data);
  });
}
