import { app, dialog } from "electron";
import { autoUpdater, UpdateCheckResult, UpdateInfo } from "electron-updater";
import { isVersionGreater, parseVersion } from "./semver";
import { Settings } from "./settings";
import LOGGER from "./log";
import { Session } from "./session";

export class Updater {
  updateCheckInterval: NodeJS.Timeout | null = null;

  get settings(): Settings {
    return Session.getSettings();
  }

  constructor() {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;
    // FIXME: Need to also explicitly set feed url
    // autoUpdater.setFeedURL({ provider: "github", channel: this.settings.updateChannel, vPrefixedTagName: true });
    autoUpdater.channel = this.settings.updateSettings.updateChannel;
    LOGGER.info(new Error(autoUpdater.getFeedURL()?.toString()));
    autoUpdater.allowDowngrade = false;
    autoUpdater.logger;
  }

  private shouldUpdate(info: UpdateInfo) {
    const currentVersion = parseVersion(app.getVersion());
    const infoVersion = parseVersion(info.version);
    if (isVersionGreater(infoVersion, currentVersion) && this.settings.updateSettings.updatePromptBefore) {
      const res = dialog.showMessageBoxSync({
        type: "info",
        title: "Update Available",
        message: "A new version of the app is available and ready to install.\nUpdating may improve performance and fix bugs.",
        buttons: ["Yes", "No"],
      });
      return res == 0;
    }
  }

  checkForUpdate(): Promise<UpdateCheckResult | null> {
    return autoUpdater.checkForUpdates();
  }

  initListeners() {
    autoUpdater.on("update-available", (info) => {
      if (this.shouldUpdate(info)) {
        // Download and apply update
        autoUpdater.downloadUpdate();
      }
    });

    autoUpdater.on("error", (err) => LOGGER.error(err));

    autoUpdater.on("update-downloaded", (info) => {
      const res = dialog.showMessageBoxSync({
        type: "info",
        title: "Update Downloaded",
        message: `Version ${info.version} has been downloaded. Restart to install?`,
        // TODO: This means I need to enable it to check and install a downloaded update on restart
        buttons: ["Restart Now", "Later"],
      });

      if (res === 0) {
        autoUpdater.quitAndInstall();
      } else {
        autoUpdater.autoInstallOnAppQuit = true;
      }
    });
  }

  startPeriodicUpdateChecks() {
    // Interval is in ms so we need to convert to minutes which is what the settings stores in
    const interval = this.settings.updateSettings.updateCheckInterval;
    this.checkForUpdate();
    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdate();
    }, interval);
  }

  stopPeriodicUpdates() {
    this.updateCheckInterval?.close();
  }
}

export const appUpdater = new Updater();
