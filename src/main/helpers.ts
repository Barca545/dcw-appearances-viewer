import { BaseWindow, dialog } from "electron";
import { app } from "electron";
import fs from "fs";

import { Session } from "./session";
import path from "path";
import { AppMessages } from "../common/apiTypes";
/**ASSUMES THE CLOSE EVENT DEFAULT BEHAVIOR IS BLOCKED */
export async function savePromptBeforeClose(session: Session) {
  // console.log("close logic called?");
  // if (!session.isClean) {
  //   const choice = dialog.showMessageBoxSync(session.win, {
  //     title: "Confirm",
  //     message: messages.closeWarning,
  //     type: "question",
  //     buttons: ["Yes", "No", "Cancel"],
  //   });
  //   if (choice == 0) {
  //     session.isClean = true;
  //     await session.saveFn();
  //   } else if (choice == 1) {
  //     // Just mark clean but no save
  //     session.isClean = true;
  //   } else if (choice == 2) {
  //     return;
  //   }
  // } else {
  //   session.isClean = true;
  // }
  // session.close();
}

// Constant declarations

// Constants
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
export const __userdata = `${app.getPath("userData")}/DCDB Appearances/`;
export const MESSAGES: AppMessages = JSON.parse(fs.readFileSync("appMessages.json", { encoding: "utf-8" }));
