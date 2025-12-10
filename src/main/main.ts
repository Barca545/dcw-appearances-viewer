import { app, dialog } from "electron";
import { Session } from "./session";
import { __userdata, IS_DEV, makeUninstallScript, RESOURCE_PATH, UPDATE_PATH as UPDATE_DOT_EXE } from "./main_utils";
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
// - Add Cloudflare log reporting

// Read more on getPath: https://www.electronjs.org/docs/latest/api/app#appgetpathname

/**Returns `true` if a Squirrel startup event occured. Implementation adapted from [this Stack Overflow post](https://stackoverflow.com/questions/43989408/creating-a-desktop-shortcut-via-squirrel-events-with-electron).*/
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

const log = LOGGER.default();

process.on("uncaughtException", (err) => {
  // TODO: I am not sure this should always be fatal
  log.fatal(err.name, err.stack || err.message);
});

// Prevent multiple startups during installation
if (handleStartupEvent()) app.quit();

// TODO: I am not actually sure if holding the session here at the top level after init is needed
// It would be in rust but it's possible that is not the case in JS/TS
const _session = app.whenReady().then(() => {
  let session = new Session();
  // TODO: Move this stuff out of the whenReady?
  const LOG_DIR = IS_DEV ? path.join(process.cwd(), "logs") : path.join(app.getPath("userData"), "Logs");
  app.setAppLogsPath(LOG_DIR);
  session.initListeners();
  return session;
});
