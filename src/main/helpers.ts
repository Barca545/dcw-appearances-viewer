import { dialog } from "electron";
import { messages } from "./main";

import { Session } from "./session";
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
