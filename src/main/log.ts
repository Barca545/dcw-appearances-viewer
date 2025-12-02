import { app } from "electron";
import { IS_DEV } from "./main_utils";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

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
  // TODO: Error example 2025-11-23T17:41:25.2355209-05:00 ERROR Position LineCol { line: 14, col: 30 } column exceeds line length 1, clamping it
  logFile = path.join(app.getPath("logs"), "app.log");

  private constructor() {
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

    const message = `${dateTime}| v${app.getVersion()} | [${level}] ${name}| ${err}\n\n`;

    if (IS_DEV) {
      console.log(message);
    } else {
      fs.appendFileSync(this.logFile, message, "utf-8");
    }
  }
}

interface UserInfo {
  osType: string;
  platform: string;
  arch: string;
  cpuInfo: os.CpuInfo[];

  app_path: string;
}

// TODO: Unsure this is needed
interface AppInfo {
  version: string;
  platform: string;
  memUse: string; // process.getProcessMemoryInfo() ​
}

function makeInfo() {
  const info = {
    osType: os.type(),
    cpu: os.cpus(),
  };
}

// https://www.electronjs.org/docs/latest/api/crash-reporter
// https://engineroom.teamwork.com/serverless-crash-reporting-for-electron-apps-fe6e62e5982a
// https://github.com/electron/electron/issues/4259
// https://nodejs.org/api/os.html
// https://www.google.com/search?q=bugsplat+free+alternative&client=firefox-b-1-d&sca_esv=3a312d9b2e564329&sxsrf=AE3TifOCopRIKg4JH2iKGtqauZFYWMmvmw%3A1764656012819&ei=jIMuaYPcMYm05NoP9_rFuQM&ved=0ahUKEwiD0q32n56RAxUJGlkFHXd9MTcQ4dUDCBE&uact=5&oq=bugsplat+free+alternative&gs_lp=Egxnd3Mtd2l6LXNlcnAiGWJ1Z3NwbGF0IGZyZWUgYWx0ZXJuYXRpdmUyBRAhGKABMgUQIRigATIFECEYoAFI8xdQgQNYgRdwAXgAkAEAmAFGoAG9CKoBAjE4uAEDyAEA-AEBmAISoALFCMICChAAGLADGNYEGEfCAg0QABiABBiwAxhDGIoFwgIOEAAYsAMY5AIY1gTYAQHCAhkQLhiABBiwAxjRAxhDGMcBGMgDGIoF2AEBwgIWEC4YgAQYsAMYQxjlBBjIAxiKBdgBAcICGRAuGIAEGLADGEMYxwEYyAMYigUYrwHYAQHCAgoQABiABBgUGIcCwgIFEAAYgATCAgYQABgWGB7CAggQABgWGAoYHsICBRAhGKsCwgIFECEYnwWYAwCIBgGQBhC6BgYIARABGAmSBwIxOKAH5EyyBwIxN7gHvAjCBwYwLjE3LjHIByI&sclient=gws-wiz-serp
