import { app, dialog, ipcMain, shell } from "electron";
import { Session } from "./session";
import { createCharacterName } from "../common/utils";
import { fetchList } from "../../core/fetch";
import { SubmitResponse } from "../common/apiTypes";
import { __userdata, IS_MAC, LOG, RESOURCE_PATH, ROOT_DIRECTORY } from "./main_utils";
import path from "path";
import Child from "child_process";
import fs from "fs";

// Prevent multiple startups during installation

process.on("uncaughtException", (err) => {
  LOG(err.name, err.stack as string);
});

// From here: https://stackoverflow.com/questions/43989408/creating-a-desktop-shortcut-via-squirrel-events-with-electron
function handleStartupEvent(): boolean {
  // Exit if there are no events
  if (process.argv.length < 2) {
    return false;
  }
  const event = process.argv[1];
  const updateDotExe = path.resolve(path.join(ROOT_DIRECTORY, "Update.exe"));
  const exeName = path.basename(process.execPath);

  function spawn(cmd: string, ...args: string[]): Child.ChildProcessWithoutNullStreams {
    let spawnedProcess;

    try {
      spawnedProcess = Child.spawn(cmd, args, { detached: true });
    } catch (e) {
      const err = e as Error;
      // TODO: Figure out if not catching it here will cause a log to happen
      LOG(err.name, err.stack as string);
      // TODO: I don't love needing to have this here but whatever
      // FIXME: Explicit error do not exit silently
      throw new Error(err.message);
    }

    return spawnedProcess;
  }

  function spawnUpdate(...args: string[]) {
    spawn(updateDotExe, ...args);
  }

  switch (event) {
    case "--squirrel-install": {
      // TODO: This may need to go to the update logic or something since the original references I use stick it in update for some reason
      spawnUpdate("--create-shortcut", exeName, "--shortcut-locations=Desktop,StartMenu");
      // TODO: Move logic to create necessary folders for resources here
      try {
        const settingsSrc = path.join(RESOURCE_PATH, "settings.json");
        const settingsDst = path.join(__userdata, "settings.json");
        fs.copyFileSync(settingsSrc, settingsDst, fs.constants.COPYFILE_EXCL);
      } catch (e) {
        const err = e as Error;
        LOG(err.name, err.stack as string);
      }
      return true;
    }
    case "--squirrel-uninstall": {
      spawnUpdate("--removeShortcut", exeName, "--shortcut-locations=Desktop, StartMenu");
      fs.rmdirSync(__userdata);
      return true;
    }
    case "--squirrel-updated": {
      spawnUpdate("--create-shortcut", exeName, "--shortcut-locations=Desktop,StartMenu");
      // TODO: Move logic to create necessary folders for resources here
      return true;
    }
    case "--squirrel-obsolete":
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated
      return true;
  }
  return false;
}

if (handleStartupEvent()) app.quit();

// TODO: I am not actually sure if holding the session here at the top level after init is needed
// It would be in rust but it's possible that is not the case in JS
let session: Session;

app.whenReady().then(() => {
  init();
  LOG("Session exists", JSON.stringify(session));
});

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
  session = new Session();

  // MAC BEHAVIOR
  // Quit the application when all windows/tabs are closed
  ipcMain.on("window-all-closed", (_e) => {
    if (!IS_MAC) app.quit();
  });

  // FIXME: Ideally this would be part of creating the session
  session.win.on("close", (e) => {
    if (!session.isClean) {
      e.preventDefault();
      session.saveFile(false);
    }
  });

  // NAVIGATION LISTENERS

  // FIXME: This needs to get split into navigate:page and navigate:file
  ipcMain.on("open:page", (_e, page) => session.openAppPage(page));
  // TODO: Arguably the internal open dialog should occur out here.
  // Open file should possibly be more general and just take a filepath
  ipcMain.on("open:file", (_e, _page) => session.openFile());
  ipcMain.on("open:URL", (_e, url) => shell.openExternal(url));

  ipcMain.handle("form:submit", async (_e, data) => {
    const character = createCharacterName(data);
    // Confirm this actually updates session. I am not positive session is actually a mutable reference
    session.projectData.meta.character = character;
    const res = await fetchList(character);

    // FIXME: This is pretty janky reventyally I want to send the actual data over
    if (!res.ok()) {
      return { success: false, character: character };
    }

    session.projectData.data = res.unwrap();
    // TODO: Use an alert to show a proper error for if the name is wrong (basically if fetch comes back empty)

    const send: SubmitResponse = {
      success: true,
      appearances: session.projectData.data,
      character: character,
    };

    session.isClean.task = false;
    return send;
  });

  // TODO: Figure out why it randomly errors sometimes and says the reflow function does not exist
  ipcMain.handle("filterOptions", (_e, options) => {
    // TODO: If I just target the focused I don't see how it could go wrong but maybe there are edge cases where it does?
    session.opt = options;
    session.isClean.task = false;
    return session.reflow();
  });

  ipcMain.handle("error:show", (_e, title, msg) => dialog.showErrorBox(title, msg));

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

  // TODO: Theoretically this stuff should go into the init of session
  // TODO: Fill out this logic
  session.win.on("blur", () => {
    // It should save on blur and on close
  });

  session.win.on("close", () => {
    // It should save on blur and on close
  });
}
