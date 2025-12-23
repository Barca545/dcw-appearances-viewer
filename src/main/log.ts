import { app } from "electron";
import { IS_DEV } from "./main_utils";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

/**
 *
 * # Log Levels
 * - **INFO**: Significant events.
 * - **WARN**: Abnormal situations that may indicate future problems.
 * - **ERROR**: Unrecoverable errors that affect a specific operation.
 * - **FATAL**: Unrecoverable errors that affect the entire program.
 */
export enum LogLevel {
  /**Significant events. */
  Info = "INFO",
  /**Abnormal situations that may indicate future problems. */
  Warn = "WARN",
  /**Unrecoverable errors that affect a specific operation. */
  Error = "ERROR",
  /**Unrecoverable errors that affect the entire program. */
  Fatal = "FATAL",
}

// https://www.electronjs.org/docs/latest/api/crash-reporter
// https://engineroom.teamwork.com/serverless-crash-reporting-for-electron-apps-fe6e62e5982a
// https://github.com/electron/electron/issues/4259
// https://nodejs.org/api/os.html
// https://www.google.com/search?q=bugsplat+free+alternative&client=firefox-b-1-d&sca_esv=3a312d9b2e564329&sxsrf=AE3TifOCopRIKg4JH2iKGtqauZFYWMmvmw%3A1764656012819&ei=jIMuaYPcMYm05NoP9_rFuQM&ved=0ahUKEwiD0q32n56RAxUJGlkFHXd9MTcQ4dUDCBE&uact=5&oq=bugsplat+free+alternative&gs_lp=Egxnd3Mtd2l6LXNlcnAiGWJ1Z3NwbGF0IGZyZWUgYWx0ZXJuYXRpdmUyBRAhGKABMgUQIRigATIFECEYoAFI8xdQgQNYgRdwAXgAkAEAmAFGoAG9CKoBAjE4uAEDyAEA-AEBmAISoALFCMICChAAGLADGNYEGEfCAg0QABiABBiwAxhDGIoFwgIOEAAYsAMY5AIY1gTYAQHCAhkQLhiABBiwAxjRAxhDGMcBGMgDGIoF2AEBwgIWEC4YgAQYsAMYQxjlBBjIAxiKBdgBAcICGRAuGIAEGLADGEMYxwEYyAMYigUYrwHYAQHCAgoQABiABBgUGIcCwgIFEAAYgATCAgYQABgWGB7CAggQABgWGAoYHsICBRAhGKsCwgIFECEYnwWYAwCIBgGQBhC6BgYIARABGAmSBwIxOKAH5EyyBwIxN7gHvAjCBwYwLjE3LjHIByI&sclient=gws-wiz-serp

/**Each new version of the application will generate its own `LogFile`. */
class LoggerClass {
  LOG_PATH = path.join(app.getPath("logs"), `LOG_v${app.getVersion()}.json`);
  sessionStart: string;

  constructor() {
    this.sessionStart = LoggerClass.makeCurrentTimestamp();
  }

  // TODO: If this is async it can be made async
  private async writeLogToFile(log: Log) {
    // Open and parse the file
    // try...catch is needed because it errors if no file
    let logFile: LogFile;
    try {
      logFile = JSON.parse(fs.readFileSync(this.LOG_PATH, "utf-8")) as LogFile;

      // If the log file does not already have the current session as a session we need to create it.
      if (logFile.sessions[logFile.sessions.length - 1].startTime != this.sessionStart) {
      }
    } catch {
      // Just create a new file
      logFile = { info: await makeUserInfoUserInfo(), sessions: [LoggerClass.newSessionLog()] };
    }
    // Append to the end of the current session
    logFile.sessions[logFile.sessions.length - 1].logs.push(log);

    fs.writeFileSync(this.LOG_PATH, JSON.stringify(logFile), "utf-8");
  }

  private static newSessionLog(): SessionLog {
    return { startTime: LoggerClass.makeCurrentTimestamp(), logs: [] };
  }

  /** Returns the formatted current Date and Time. */
  private static makeCurrentTimestamp(): string {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hourCycle: "h12",
    }).format(new Date());
  }

  private _log(name: string, err: string, level = LogLevel.Info) {
    const log = { time: LoggerClass.makeCurrentTimestamp(), level, name, message: err };

    if (IS_DEV) {
      console.log(log);
    } else {
      this.writeLogToFile(log);
    }
  }

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
}

const LOGGER = new LoggerClass();
export default LOGGER;

interface LogFile {
  info: UserInfo;
  sessions: SessionLog[];
}

/** The Logs for a single `Session`.*/
interface SessionLog {
  startTime: string;
  logs: Log[];
}

export interface Log {
  time: string;
  level: LogLevel;
  name: string;
  message: string;
}

interface UserInfo {
  /**The operating system name as returned by [`uname(3)`](https://linux.die.net/man/3/uname). */
  osType: string;
  /**OS model and */
  platform: string;
  /** Arch the program was compiled for. */
  arch: string;
  /**Physical CPU info. */
  cpuInfo: os.CpuInfo[];
  /**The current application directory.*/
  app_path: string;
  /**Returns the process' [memory info](https://www.electronjs.org/docs/latest/api/structures/process-memory-info). */
  memUse: Electron.ProcessMemoryInfo;
  /**Returns the [process' metrics](https://www.electronjs.org/docs/latest/api/structures/process-metric). */
  processInfo: Electron.ProcessMetric[];
}

async function makeUserInfoUserInfo(): Promise<UserInfo> {
  return {
    osType: os.type(),
    platform: `${os.platform()} ${process.getSystemVersion()}`,
    arch: os.arch(),
    cpuInfo: os.cpus(),
    app_path: app.getAppPath(),
    memUse: await process.getProcessMemoryInfo(),
    processInfo: app.getAppMetrics(),
  };
}

interface ErrorReport {
  userInfo: UserErrorInfo;
  logs: LogFile;
}

export interface UserErrorInfo {
  title: string;
  startTime: string;
  description: string;
}
