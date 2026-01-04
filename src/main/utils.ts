import { BaseWindow, dialog } from "electron";
import { app } from "electron";
import fs from "node:fs";
import { AppMessages } from "../common/apiTypes";
import path from "node:path";
import JSON from "json5";
import { DEFAULT_SETTINGS, Settings } from "./settings";
import LOGGER from "./log";

// Constant declarations
export const APPID = "DCDB-Appearance-Viewer";

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

/**The directory for storing your app's configuration files, which by default is the appData directory appended with your app's name.
 * By convention files storing user data should be written to this directory.
 * It is not recommended to write large files.
 * Some environments may backup this directory to cloud storage. */
export const __userdata = `${app.getPath("userData")}`;

/** Path to the Application's resource folder. */
export const RESOURCE_PATH = IS_DEV ? path.join(process.cwd(), "resources") : `${process.resourcesPath}`;
/**The path to the program's "Update.exe". */
export const UPDATE_PATH = path.join(app.getPath("exe"), "..", "..", "Update.exe");
/**This is the path to the user's settings file, "settings.json" */
export const SETTINGS_PATH = path.join(__userdata, "settings.json");

export const MESSAGES: AppMessages = JSON.parse(fs.readFileSync(`${RESOURCE_PATH}/appMessages.json`, { encoding: "utf-8" }));
export const APP_NAME = "dcdb_appearances_viewer";

export declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
export declare const MAIN_WINDOW_VITE_NAME: string;

/**Address of the root directory */
// TODO: Arguably this should be renamed since __dirname points inside the asar
export const ROOT_DIRECTORY = IS_DEV ? MAIN_WINDOW_VITE_DEV_SERVER_URL : __dirname;

// LOGGING

/** Create a script to uninstall the program. */
export function makeUninstallScript(...folders: string[]): string {
  let script = `@echo off
  :loopstart

  REM %1 = first command line argument 
  REM TODO: possibly replace %1 with file path via string interpolation
  tasklist /fi "IMAGENAME eq ${UPDATE_PATH}" /fo csv 2>NUL | find /I "${UPDATE_PATH}"
  
  REM error 0 means no error was found which means the file is still running
  
  IF %ERRORLEVEL% EQU 0 (
    REM wait 5 seconds before checking again
    timeout /t 5 /nobreak >NUL
    goto loopstart
  )
    
  REM Also wait for Squirrel's Update.exe to end
  tasklist /FI "IMAGENAME eq Update.exe" | find /I "Update.exe" >NUL
  
  IF %ERRORLEVEL% EQU 0 (
    REM wait 5 seconds before checking again
    timeout /t 5 /nobreak >NUL
    goto loopstart
  )`;

  // Add the folders to delete to the script
  for (const folder of folders) {
    // /S deletes a folder and its contents and /Q keeps it from prompting the user
    // script += `\nRMDIR /S /Q "${folder}"`;
    script += `\nRMDIR /S "${folder}"`;
  }

  return script;
}

// Settings is a common folder
// it cannot import anything that imports stuff unique to node so this needs to be in utils
/**Function for creating a settings file during installation.
 * Returns the new settings.
 */
export function create_settings_file(): Settings {
  // Create the userdata file if it does not exist
  if (!fs.existsSync(__userdata)) {
    fs.mkdirSync(__dirname, { recursive: true });
  }

  // TODO: Need some way to install new settings but keep existing user ones
  // Only write if settings.json doesn't exist
  if (!fs.existsSync(SETTINGS_PATH)) {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(DEFAULT_SETTINGS, null, 2), { encoding: "utf8" });
    LOGGER.info(new Error("Created missing settings.json"));
  } else {
    LOGGER.info(new Error("settings.json already exists, skipping creation"));
  }

  return JSON.parse(fs.readFileSync(SETTINGS_PATH, { encoding: "utf-8" }));
}
