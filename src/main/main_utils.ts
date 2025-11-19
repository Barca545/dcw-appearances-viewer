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

/** Path to the Application's userdata folder. */
export const RESOURCE_PATH = IS_DEV ? `${process.cwd()}/resources` : `${process.resourcesPath}`;

export const MESSAGES: AppMessages = JSON.parse(fs.readFileSync(`${RESOURCE_PATH}/appMessages.json`, { encoding: "utf-8" }));
export const APP_NAME = "dcdb_appearances_viewer";
/**The directory for storing your app's configuration files, which by default is the appData directory appended with your app's name.
 * By convention files storing user data should be written to this directory.
 * It is not recommended to write large files.
 * Some environments may backup this directory to cloud storage. */
export const __userdata = `${app.getPath("userData")}`;

// LOGGING

// TODO: Change the prod path in real dev
const LOG_PATH = IS_DEV ? path.join(process.cwd(), "logs") : `C:/Users/jamar/Documents/Hobbies/Coding/publication_date_sort/logs`; //path.join(app.getPath("userData"), "logs");
app.setAppLogsPath(LOG_PATH);

export function LOG(name: string, err: string) {
  const logFile = path.join(app.getPath("logs"), "app.log");
  let date = new Date().getTime();
  // TODO: Final logs need dateTime
  fs.appendFileSync(logFile, `${date}| ${name}: ${err}\n`, "utf-8");
}

// how would I make the program print it's stack to a log if it ever crashes?
