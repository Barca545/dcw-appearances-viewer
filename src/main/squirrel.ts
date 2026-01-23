// import { app, dialog } from "electron";
// import path from "path";
// import LOGGER from "./log";
// import { create_settings_file, __userdata, /*makeUninstallScript,*/ UPDATE_PATH as UPDATE_DOT_EXE } from "./utils";
// import Child from "child_process";

// // Squirrel installer documentation: https://github.com/electron/windows-installer

// // /**Returns `true` if a Squirrel startup event occured. Returns false if the event was `--squirrel-firstrun`. Implementation adapted from [this Stack Overflow post](https://stackoverflow.com/questions/43989408/creating-a-desktop-shortcut-via-squirrel-events-with-electron).*/
// // export default function handleStartupEvent(): boolean {
// //   if (process.platform != "win32") {
// //     // FIXME: Should error about the wrong platform
// //     // FIXME: Should be in messages
// //     dialog.showErrorBox(
// //       // FIXME: This actually can't error because it shows the compiled platform not the host info
// //       "Incompatible Platform",
// //       `This application is intended for 'win32' platforms and is incompatible with ${process.platform} platforms.`,
// //     );
// //     return true;
// //   }

// //   if (process.argv.length < 2) {
// //     // TODO: Error dialog boxes do not need a ready app, use to display any installation errors that occur
// //     // Exit if there are no events
// //     return false;
// //   }
// //   const event = process.argv[1];
// //   const exeName = path.basename(app.getPath("exe"));

// //   switch (event) {
// //     case "--squirrel-firstrun": {
// //       create_settings_file();
// //       return false;
// //     }
// //     // NOTE: Fall through
// //     case "--squirrel-install": {
// //     }
// //     case "--squirrel-updated": {
// //       // Will update shortcut if needed
// //       spawnUpdate("--createShortcut", exeName, "--shortcut-locations=Desktop,StartMenu");

// //       create_settings_file();

// //       return true;
// //     }
// //     case "--squirrel-uninstall": {
// //       const UNINSTALL_SCRIPT = makeUninstallScript(
// //         app.getPath("appData"),
// //         app.getPath("userData"),
// //         // "appDataPath"
// //         // "localAppDataPath",
// //         // "userDataPath",
// //         // "squirrelTempPath",
// //       );

// //       // TODO: This probably needs an an error dialog on fail too
// //       spawnUpdate("--removeShortcut", exeName, "--shortcut-locations=Desktop,StartMenu");
// //       try {
// //         spawn(UNINSTALL_SCRIPT);
// //       } catch (e) {
// //         const err = e as Error;
// //         err.message = `Uninstall removal fail: ${err.message}`;
// //         LOGGER.fatal(err);
// //         dialog.showErrorBox(`uninstall ${err.name} removal fail.`, `${err.stack || err.message}`);
// //       }
// //       return true;
// //     }
// //     case "--squirrel-obsolete":
// //       // This is called on the outgoing version of your app before
// //       // we update to the new version - it's the opposite of
// //       // --squirrel-updated
// //       return true;
// //   }
// //   return false;
// // }

// function spawnUpdate(...args: string[]) {
//   const proc = spawn(UPDATE_DOT_EXE, ...args);
//   // TODO: I want to log this but perhaps unnecessary
//   // const log_message = `proc.spawnargs: ${proc.spawnargs.toString()}`;
//   // LOGGER.info(new Error(log_message));
//   proc.on("error", (err) => {
//     err.message = `Squirrel Spawn Error: ${err.message}`;
//     LOGGER.fatal(err);
//   });
//   proc.on("exit", (code, signal) => {
//     // 0 is success
//     if (code !== null && code !== 0) {
//       LOGGER.error(new Error(`Update.exe exited with code: ${code}`));
//     } else {
//       LOGGER.error(new Error(`Update.exe exited with code: ${signal as NodeJS.Signals}`));
//     }
//   });
// }

// function spawn(cmd: string, ...args: string[]): Child.ChildProcessWithoutNullStreams {
//   let spawnedProcess;

//   try {
//     spawnedProcess = Child.spawn(cmd, args, { detached: true, stdio: "pipe" }); //shell: true,
//   } catch (e) {
//     const err = e as Error;
//     // This is fatal because if for some reason any of these fail to execute the application will experience problems
//     LOGGER.fatal(err);
//     throw new Error(err.message);
//   }

//   return spawnedProcess;
// }
