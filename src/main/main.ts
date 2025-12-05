import { app, dialog, ipcMain, shell } from "electron";
import { Session } from "./session";
import { createCharacterName } from "../common/utils";
import { fetchList } from "../../core/fetch";
import { SubmitResponse } from "../common/apiTypes";
import { __userdata, IS_DEV, IS_MAC, makeUninstallScript, RESOURCE_PATH, UPDATE_PATH as UPDATE_DOT_EXE } from "./main_utils";
import path from "path";
import { LOGGER } from "./log";
import Child from "child_process";
import fs from "fs";

// TODO:
// - URGENT: merge to main
// - URGENT: Uninstall all appstuff on uninstall -> maybe impossible https://github.com/Squirrel/Squirrel.Windows/issues/1763 and https://github.com/electron/windows-installer/issues/113cd
// - URGENT: Add github release - https://www.electronforge.io/config/publishers/github
// - URGENT: Add autoupdater - https://www.electronforge.io/config/publishers/github && https://www.electronjs.org/docs/latest/tutorial/updates
// - URGENT: Add check for all files installed correctly on first startup and log errors if stuff is missing

// Read more on getPath: https://www.electronjs.org/docs/latest/api/app#appgetpathname

const log = LOGGER.default();

process.on("uncaughtException", (err) => {
  // TODO: I am not sure this should always be fatal
  log.fatal(err.name, err.stack || err.message);
});

// Prevent multiple startups during installation
if (handleStartupEvent()) app.quit();

// From here: https://stackoverflow.com/questions/43989408/creating-a-desktop-shortcut-via-squirrel-events-with-electron
/**Returns `true` if a Squirrel startup event occured. */
function handleStartupEvent(): boolean {
  if (process.platform != "win32") {
    // FIXME: Should error about the wrong platform
    dialog.showErrorBox(
      // FIXME: This actually can't error because it shows the compiled platform not the host info
      "Incompatible Platform",
      `This application is intended for 'win32' platforms and is incompatible with ${process.platform} platforms.`,
    );
    return true;
  }

  if (process.argv.length < 2) {
    // TODO: Error dialog boxes do not need a ready app, use to display any installation errors that occur
    // Exit if there are no events
    return false;
  }
  const event = process.argv[1];
  const exeName = path.basename(app.getPath("exe"));

  function spawn(cmd: string, ...args: string[]): Child.ChildProcessWithoutNullStreams {
    let spawnedProcess;

    try {
      spawnedProcess = Child.spawn(cmd, args, { detached: true, stdio: "pipe" }); //shell: true,
    } catch (e) {
      const err = e as Error;
      // This is fatal because if for some reason any of these fail to execute the application will experience problems
      log.fatal(err.name, err.stack || err.message);
      throw new Error(err.message);
    }

    return spawnedProcess;
  }

  function spawnUpdate(...args: string[]) {
    const proc = spawn(UPDATE_DOT_EXE, ...args);
    log.info("proc.spawnargs", proc.spawnargs.toString());
    proc.on("error", (err) => log.fatal("Squirrel Spawn Error", err.stack || err.message));
    proc.on("exit", (code, signal) => {
      // 0 is success
      if (code !== null && code !== 0) {
        log.error("Update.exe exited with code", code.toString());
      } else {
        log.error("Update.exe killed with signal", signal as NodeJS.Signals);
      }
    });
  }

  switch (event) {
    // NOTE: Fall through
    case "--squirrel-install":
    // Squirrel installer documentation: https://github.com/electron/windows-installer
    // case "--squirrel-firstrun":
    case "--squirrel-updated": {
      // Will update shortcut if needed
      spawnUpdate("--createShortcut", exeName, "--shortcut-locations=Desktop,StartMenu");
      // TODO: Need some way to install new settings but keep existing user ones
      // I.e. diff the files and only paste new settings
      // TODO: Setting up userdata should probably go under first run
      try {
        const settingsSrc = path.join(RESOURCE_PATH, "settings.json");
        const settingsDst = path.join(__userdata, "settings.json");
        fs.copyFileSync(settingsSrc, settingsDst, fs.constants.COPYFILE_EXCL);
      } catch (e) {
        const err = e as Error;
        // Info cuz expected behavior but under some circumstances may indicate failure
        log.info("Update copy fail", `${err.message}`);
      }
      return true;
    }
    case "--squirrel-uninstall": {
      const UNINSTALL_SCRIPT = makeUninstallScript([
        app.getPath("appData"),
        app.getPath("userData"),
        // "appDataPath"
        // "localAppDataPath",
        // "userDataPath",
        // "squirrelTempPath",
      ]);

      // TODO: This probably needs an an error dialog on fail too
      spawnUpdate("--removeShortcut", exeName, "--shortcut-locations=Desktop,StartMenu");
      try {
        // fs.rmSync(__userdata, { recursive: true, force: true });
        spawn(UNINSTALL_SCRIPT);
      } catch (e) {
        const err = e as Error;
        log.fatal(err.name, `Uninstall removal fail.\n${err.stack || err.message}`);
        dialog.showErrorBox(`uninstall ${err.name} removal fail.`, `${err.stack || err.message}`);
      }
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

// TODO: I am not actually sure if holding the session here at the top level after init is needed
// It would be in rust but it's possible that is not the case in JS
let session: Session;

app.whenReady().then(() => {
  // TODO: Move this stuff out of the whenReady?
  const LOG_DIR = IS_DEV ? path.join(process.cwd(), "logs") : path.join(app.getPath("userData"), "Logs");
  app.setAppLogsPath(LOG_DIR);
  init();
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

    // FIXME: This is pretty janky eventually I want to send the actual data over
    if (!res.ok()) {
      return { success: false, character: character };
    }

    session.projectData.data = res.unwrap();
    // TODO: Use an alert to show a proper error for if the name is wrong (basically if fetch comes back empty)

    const send: SubmitResponse = {
      success: true,
      appearances: session.projectData.data,
      character: character,
      density: session.opt.density,
    };

    session.isClean.task = false;
    return send;
  });

  // TODO: Figure out why it randomly errors sometimes and says the reflow function does not exist
  ipcMain.handle("filterOptions", (_e, options) => {
    console.log(options);
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

  ipcMain.on("filter:order", (_e, order) => {
    session.opt.order = order;
    session.isClean.task = false;
  });

  ipcMain.on("filter:density", (_e, density) => {
    session.opt.density = density;
    session.isClean.task = false;
  });

  ipcMain.on("filter:asc", (_e, asc) => {
    session.opt.ascending = asc;
    session.isClean.task = false;
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
