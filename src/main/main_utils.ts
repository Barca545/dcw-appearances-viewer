import { BaseWindow, dialog } from "electron";
import { app } from "electron";
import fs from "node:fs";
import { AppMessages } from "../common/apiTypes";
import path from "node:path";

// Constant declarations

/**Is a dev or production build?*/
export const IS_DEV = !app.isPackaged;

/**Is the platform a MAC? */
export const IS_MAC = process.platform === "darwin";

// TODO: Not sure this is ideal but I can't think of a better place for now maybe a constants file?
export const UNIMPLEMENTED_FEATURE = () => {
  // FIXME: It's possible however I do tabs won't work with this but...
  // App will only have one window so that will always be the focused window
  const win = BaseWindow.getFocusedWindow() as BaseWindow;
  dialog.showMessageBoxSync(win, { message: MESSAGES.unimplemented, buttons: ["OK"] });
};

/** Path to the Application's resource folder. */
export const RESOURCE_PATH = IS_DEV ? `${process.cwd()}/resources` : `${process.resourcesPath}`;

export const MESSAGES: AppMessages = JSON.parse(fs.readFileSync(`${RESOURCE_PATH}/appMessages.json`, { encoding: "utf-8" }));
export const APP_NAME = "dcdb_appearances_viewer";
/**The directory for storing your app's configuration files, which by default is the appData directory appended with your app's name.
 * By convention files storing user data should be written to this directory.
 * It is not recommended to write large files.
 * Some environments may backup this directory to cloud storage. */
export const __userdata = `${app.getPath("userData")}`;

/**Address of the root directory */
// TODO: Arguably this should be renamed since __dirname points inside the asar
export const ROOT_DIRECTORY = IS_DEV ? MAIN_WINDOW_VITE_DEV_SERVER_URL : __dirname;

// TODO: how do I make the program print its stack to a log if it ever crashes?

// LOGGING

// TODO: Add Log levels
export enum LogLevel {
  Info = "INFO",
  Warn = "WARN",
  Error = "ERROR",
  Fatal = "FATAL",
}

/**
 *
 * # Log Levels
 * - **INFO**: Significant events.
 * - **WARN**: Abnormal situations that may indicate future problems.
 * - **ERROR**: Unrecoverable errors that affect a specific operation.
 * - **FATAL**: Unrecoverable errors that affect the entire program.
 */
export class LOGGER {
  logFile = path.join(app.getPath("logs"), "app.log");

  private constructor(logFile?: string) {
    // Append a break between runs to distinguish different runs?
    fs.appendFileSync(this.logFile, "");
  }

  static default(): LOGGER {
    return new LOGGER();
  }

  // TODO: Consider fields for both message and stack.

  /**Create a new `INFO` log. `INFO` logs indicate significant events.*/
  info(name: string, err: string) {
    this._log(name, err, LogLevel.Info);
  }
  /**Create a new `WARN` log. `WARN` logs indicate abnormal situations that may indicate future problems.*/
  warn(name: string, err: string) {
    this._log(name, err, LogLevel.Warn);
  }
  /**Create a new `ERROR` log. `ERROR` logs indicate unrecoverable errors that affect a specific operation.*/
  error(name: string, err: string) {
    this._log(name, err, LogLevel.Error);
  }
  /**Create a new `FATAL` log. `FATAL` logs indicate unrecoverable errors that affect the entire program.*/
  fatal(name: string, err: string) {
    this._log(name, err, LogLevel.Fatal);
  }

  private _log(name: string, err: string, level = LogLevel.Info) {
    const dateTime = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hourCycle: "h12",
    }).format(new Date());
    fs.appendFileSync(this.logFile, `${dateTime}| v${app.getVersion()} | [${level}] ${name}| ${err}\n\n`, "utf-8");
  }
}
