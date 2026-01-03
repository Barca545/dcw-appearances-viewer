import { app } from "electron";
import { Session } from "./session";
import { __userdata } from "./utils";
import LOGGER from "./log";
import handleStartupEvent from "./squirrel";
import { appUpdater } from "./autoupdate";

// - URGENT: Add autoupdater - https://www.electronforge.io/config/publishers/github && https://www.electronjs.org/docs/latest/tutorial/updates
// FIXME: Why is trysave failing
// FIXME: Why does the dot reset if trysave fails?
//  - Because despite throwing an error trysave continues to resetting is clean
// FIXME: If two star tabs are opened simultaneously, they cannot be closed
// FIXME: Settings creation failed dialog appears too many times
// FIXME: Does not remain open after first install

process.on("uncaughtException", (err) => {
  LOGGER.fatal(err);
});

// Prevent multiple startups during installation
if (handleStartupEvent()) app.quit();

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
