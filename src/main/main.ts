import { app } from "electron";
import { Session } from "./session";
import { __userdata } from "./utils";
import LOGGER from "./log";
import handleStartupEvent from "./squirrel";
import { appUpdater } from "./autoupdate";

// TODO: Closing the error window seems to also minimize the main window
// TODO: Store dates as YYYY-MM-DD as Amelia suggested and give user choice of how to display

enum DateOrder {
  YYYYMMDDD = "YYYY-MM-DD",
  MMDDDYYYY = "MM-DD-YYYY",
}

// - URGENT: Add autoupdater - https://www.electronforge.io/config/publishers/github && https://www.electronjs.org/docs/latest/tutorial/updates
// FIXME: Why is trysave failing
// FIXME: Why does the dot reset if trysave fails?
//  - Because despite throwing an error trysave continues to resetting is clean

// FIXME: Stuff Appears alphabetically and reversed on load, needs to be fixed see (bruce Wayne results)
// BH says to download the wiki to save time at runtime
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
