import { app, crashReporter } from "electron";
import { Session } from "./session";
import { __userdata } from "./utils";
import LOGGER from "./log";
import handleStartupEvent from "./squirrel";
import { appUpdater } from "./autoupdate";
import { Crash } from "./errors";

// TODO: Closing the error window seems to also minimize the main window

// - URGENT: Add autoupdater - https://www.electronforge.io/config/publishers/github && https://www.electronjs.org/docs/latest/tutorial/updates
// FIXME: Why is trysave failing
// FIXME: Why does the dot reset if trysave fails?
//  - Because despite throwing an error trysave continues to resetting is clean

// BH says to download the wiki to save time at runtime
process.on("uncaughtException", (err) => {
  LOGGER.fatal(err);
});

// Prevent multiple startups during installation
if (handleStartupEvent()) app.quit();

Crash.initCrashReports();
// Onstart upload any crashes from previous sessions
// (because this happens each restart it should only ever be one)
Crash.uploadCrashReports();

app.whenReady().then(() => {
  appUpdater.initListeners();
  appUpdater.checkForUpdate();
  if (appUpdater.settings.updateSettings.autoCheckForUpdates) {
    appUpdater.startPeriodicUpdateChecks();
  }

  let session = new Session();

  session.initListeners();
});

app.on("quit", () => appUpdater.stopPeriodicUpdates());
