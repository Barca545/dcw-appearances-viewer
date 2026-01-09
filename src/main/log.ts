import { app } from "electron";
import { IS_DEV, ROOT_DIRECTORY } from "./utils";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

// TODO: Give the logger the ability to see which versions they have logs for

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
  private LOG_PATH = path.join(app.getPath("logs"), `LOG_v${app.getVersion()}.json`);
  private sessionStart: string;

  constructor() {
    this.sessionStart = LoggerClass.makeCurrentTimestamp();
  }

  /**The user's logs from the current app version. */
  get versionLogs(): LogFile {
    if (IS_DEV) return { requiredPathsDoNotExist: [], sessions: [] };
    return JSON.parse(fs.readFileSync(this.LOG_PATH, { encoding: "utf-8" })) as LogFile;
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
      logFile = await this.createNewLogFile();
    }
    // Append to the end of the current session
    logFile.sessions[logFile.sessions.length - 1].logs.push(log);

    fs.writeFileSync(this.LOG_PATH, JSON.stringify(logFile, null, 2), "utf-8");
  }

  private static newSessionLog(): SessionLog {
    return { startTime: LoggerClass.makeCurrentTimestamp(), logs: [] };
  }

  async createNewLogFile(): Promise<LogFile> {
    // Create a new LogFile
    const logfile: LogFile = { requiredPathsDoNotExist: [], sessions: [LoggerClass.newSessionLog()] };

    // Log whether required paths exist
    // If no paths are missing it will not exist
    [ROOT_DIRECTORY]
      .filter((path) => !fs.existsSync(path))
      .forEach((path) => {
        if (logfile.requiredPathsDoNotExist) {
          logfile.requiredPathsDoNotExist.push(`Path ${path} does not exist.`);
        } else {
          logfile.requiredPathsDoNotExist = [`Path ${path} does not exist.`];
        }
      });

    return logfile;
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

  private _log(err: Error, level = LogLevel.Info) {
    const log = { time: LoggerClass.makeCurrentTimestamp(), level, name: err.name, stack: err.stack, message: err.message };

    if (IS_DEV) {
      console.log(log);
    } else {
      this.writeLogToFile(log);
    }
  }

  // FIXME: This all needing to be an error is suboptimal. Possibly overloading is the move

  /**Create a new `INFO` log. `INFO` logs indicate significant events.*/
  info(err: Error) {
    this._log(err, LogLevel.Info);
  }
  /**Create a new `WARN` log. `WARN` logs indicate abnormal situations that may indicate future problems.*/
  warn(err: Error) {
    this._log(err, LogLevel.Warn);
  }
  /**Create a new `ERROR` log. `ERROR` logs indicate unrecoverable errors that affect a specific operation.*/
  error(err: Error) {
    this._log(err, LogLevel.Error);
  }
  /**Create a new `FATAL` log. `FATAL` logs indicate unrecoverable errors that affect the entire program.*/
  fatal(err: Error) {
    this._log(err, LogLevel.Fatal);
  }

  writeRenderLog(log: RendererLog) {
    if (IS_DEV) {
      console.log(log);
    } else {
      this.writeLogToFile(log);
    }
  }
}

export interface LogFile {
  /**Field indicating if any files or folders the app requires are missing. */
  requiredPathsDoNotExist?: string[];
  sessions: SessionLog[];
}

/** The Logs for a single `Session`.*/
interface SessionLog {
  startTime: string;
  logs: Log[];
}

export interface MainProcessLog {
  time: string;
  level: LogLevel;
  name: string;
  stack?: string;
  message: string;
}

export interface RendererLog {
  time: string;
  level: LogLevel;
  name: string;
  message: string;
  stack?: string;
  /**[`componentStack`](https://react.dev/reference/react/captureOwnerStack) is only available during development. */
  componentStack: string | undefined | null;
  ownerStack: string | null;
}

type Log = MainProcessLog | RendererLog;

export interface UserInfo {
  /**The operating system name as returned by [`uname(3)`](https://linux.die.net/man/3/uname). */
  osType: string;
  /**OS model */
  platform: string;
  /** Arch the program was compiled for. */
  arch: string;
  /**Physical CPU info. */
  cpuInfo: os.CpuInfo[];
  // TODO: The memory stuff seems like it'd be per run
  // Not useful on a one-time struct like this
  /**Returns the process' [memory info](https://www.electronjs.org/docs/latest/api/structures/process-memory-info). */
  memUse: Electron.ProcessMemoryInfo;
  /**Returns the [process' metrics](https://www.electronjs.org/docs/latest/api/structures/process-metric). */
  processInfo: Electron.ProcessMetric[];
}

export namespace UserInfo {
  export async function create(): Promise<UserInfo> {
    return {
      osType: os.type(),
      platform: `${os.platform()} ${process.getSystemVersion()}`,
      arch: os.arch(),
      cpuInfo: os.cpus(),
      memUse: await process.getProcessMemoryInfo(),
      processInfo: app.getAppMetrics(),
    };
  }
}

const LOGGER = new LoggerClass();
export default LOGGER;
