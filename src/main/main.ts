import { app, crashReporter } from "electron";
import { Session } from "./session";
import { __userdata } from "./utils";
// import LOGGER from "./log";
// import handleStartupEvent from "./squirrel";
import { appUpdater } from "./autoupdate";
import { Crash } from "./errors";
import { handleStartupEvent } from "./startup";
import * as Sentry from "@sentry/electron/main";

// TODO: Closing the error window seems to also minimize the main window

// - URGENT: Add autoupdater - https://www.electronforge.io/config/publishers/github && https://www.electronjs.org/docs/latest/tutorial/updates
// FIXME: Why is trysave failing
// FIXME: Why does the dot reset if trysave fails?
//  - Because despite throwing an error trysave continues to resetting is clean

// TODO: BH says to download the wiki to save time at runtime

// TODO: Removing logging to test sentry.io
// process.on("uncaughtException", (err) => {
//   LOGGER.fatal(err);
// });

Sentry.init({
  dsn: "https://1ab2389962079f0f9e752b9d6fab3387@o4510838661251072.ingest.us.sentry.io/4510842180075521",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
  tracesSampleRate: 1.0,
  integrations: [Sentry.startupTracingIntegration()],

  // Enable logs to be sent to Sentry
  enableLogs: true,
});

// app.on("ready", () => {
//   throw new Error("Sentry test error in main process");
// });

// process.crash();

// TODO: Possibly handle the same way as the log.
// Save them and upload them on the next start.
// Can create a supabase bucket for this
// crashReporter.start({ uploadToServer: false });
// TODO: Save to a folder in the AppData

// Prevent multiple startups during installation
// if (handleStartupEvent()) app.quit();

// TODO: Ideally this only runs the first time after an update
handleStartupEvent();

// Crash.initCrashReports();
// // Onstart upload any crashes from previous sessions
// // (because this happens each restart it should only ever be one)
// Crash.uploadCrashReports();

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
