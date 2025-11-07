// import { ListEntry, pubDateSort } from "../../core/pub-sort.js";
// import { BaseWindow, BrowserWindow, dialog, ipcMain, Menu, nativeTheme } from "electron";
// import path from "node:path";
// import { None, Option, Some } from "../../core/option.js";
// import { loadList, SaveFormat, sessionFromJSON, sessionToJSON } from "../../core/load.js";
// import fs, { PathLike } from "fs";
// import { __userdata } from "./main.js";
// import { FilterOptions, Settings } from "../common/apiTypes.js";
// import { MAIN_WINDOW_VITE_DEV_SERVER_URL, MAIN_WINDOW_VITE_NAME, ROOT_DIRECTORY, savePromptBeforeClose } from "./helpers.js";

// // TODO: This should go in a declaration file or something
// // TODO: I am also unclear this is what this should be called. Don't my windows have different names? And what if I have multiple windows?

// // FIXME: This is supposed to be a constant that points to the path but it does not work
// // declare const MAIN_WINDOW_PRELOAD_VITE_ENTRY: string;

// // TODO: Decide if it shoud be dirname or "."

// // FIXME: It does not seem as if vite supports this for vite as it does webpack but maybe they will eventually
// const MAIN_WINDOW_PRELOAD_VITE_ENTRY = path.resolve(__dirname, "preload.js");

// type MenuTemplate = Electron.MenuItemConstructorOptions[];

// // TODO: Do I actually really need this? If I need it is there a way I can add it to the real path instead of doing this?
// class Path {
//   private path: string;

//   constructor(pathStr: PathLike) {
//     // FIXME: Confirm it is a valid path and error if not

//     this.path = pathStr.toString();
//   }

//   /**Returns the name of a path's file if it has one */
//   fileName(): Option<string> {
//     const name = path.basename(this.path);

//     if (typeof name == "undefined") {
//       return new None();
//     } else {
//       return new Some(name);
//     }
//   }

//   /**Returns the filetype of the file the path references. Returns None if there is no extension. */
//   type(): Option<string> {
//     const ty = path.extname(this.path);
//     if (ty == "") {
//       return new None();
//     } else {
//       return new Some(ty);
//     }
//   }

//   toString() {
//     return this.path.toString();
//   }
// }

// export class Sessions {
//   sessions: Map<number, Session> = new Map();
//   focused: Option<number>;
//   settings: Settings;
//   settingWinId?: number;

//   constructor() {
//     this.focused = new None();
//     this.settings = Sessions.getSettings();
//   }

//   get(id: number): Session {
//     const session = this.sessions.get(id);
//     if (session) {
//       return session;
//     } else {
//       throw new Error(`Session ${id} does not exist.`);
//     }
//   }

//   sessionChange(session: Session, sessType: SessionType) {
//     switch (sessType) {
//       case SessionType.Project: {
//         // Load the new page
//         session.loadRenderFile("application.html");
//         // Make it so you're prompted to save
//         session.onClose = savePromptBeforeClose;
//         break;
//       }
//       case SessionType.Settings: {
//         // Setting does not have a menu in final build but needs one is dev
//         if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
//           const devMenu: MenuTemplate = [{ role: "toggleDevTools" }];
//           const id = this.newChildWindow("settings.html", session.id(), devMenu, this.saveSettings, true);
//           this.settingWinId = id;
//         } else {
//           const id = this.newChildWindow("settings.html", session.id(), null, this.saveSettings, true);
//           this.settingWinId = id;
//         }

//         session.onClose = savePromptBeforeClose;
//         break;
//       }
//     }
//   }

//   /**Close the session matching id */
//   closeSession(id: number) {
//     let session = this.sessions.get(id);
//     if (session) {
//       // session.close(this, e);
//       session.close();
//     } else {
//       throw new Error(`Session ${id} does not exist.`);
//     }
//   }

//   static getSettings(): Settings {
//     // FIXME: There should be a way to have it make a settings file if there is none
//     // Maybe that can be done as part of the installation process?

//     // Skip the production stuff below if we're in dev
//     if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
//       // @ts-ignore
//       return JSON.parse(fs.readFileSync("settings.json")) as Settings;
//     } else {
//       // If there is no userdata folder make one and add the settings to
//       if (!fs.existsSync(`${__userdata}/DCDB Appearances/`)) {
//         fs.mkdirSync(`${__userdata}/DCDB Appearances/`);
//         // Copy the default settings file into userdata
//         fs.copyFileSync("settings.json", __userdata);
//       }

//       // @ts-ignore
//       return JSON.parse(fs.readFileSync(`${__userdata}/DCDB Appearances/settings.json`)) as Settings;
//     }
//   }
//   /**Applys current settings file to all windows and updates the settings field.*/
//   updateSettings(settings: Settings) {
//     this.applySettings(settings);
//     this.settings = settings;
//   }

//   /**Applys current settings file to all windows. \
//    * Does not update the settings field. */
//   applySettings(settings: Settings) {
//     // Theme
//     nativeTheme.themeSource = settings.theme;
//     // Update size
//     this.sessions.forEach((session) => {
//       // Don't resize modals
//       if (!session.win.isModal()) {
//         session.win.setSize(Number.parseInt(settings.width), Number.parseInt(settings.width));
//       }
//     });
//     // Changing the dropdown is a little more annoying
//     //  I need to swap out an HTML component on the fly

//     const id = this.settingWinId as number;
//     let settingsSess = this.get(id);
//     settingsSess.isClean = false;
//   }

//   /**Saves the `Sessions` current `settings` field to disk. */
//   async saveSettings() {
//     let settingsSess = this.get(this.settingWinId as number);
//     settingsSess.win.webContents.send("settings");

//     const file = JSON.stringify(this.settings);
//     console.log(file);
//     console.log(typeof file);
//     // In dev, save to dev settings folder
//     if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
//       fs.writeFileSync("settings.json", file);
//     } else {
//       // If there is no userdata folder make one and add the settings to
//       if (!fs.existsSync(`${__userdata}/DCDB Appearances/`)) {
//         fs.mkdirSync(`${__userdata}/DCDB Appearances/`);
//       }
//       fs.writeFileSync(`${__userdata}/DCDB Appearances/settings.json`, file);
//     }

//     settingsSess.isClean = true;
//   }

//   getFocusedSession(): Session {
//     return this.sessions.get(this.focused.unwrap()) as Session;
//   }

//   /**Create a new `Session` in the sessions instance and returns its `Session`.
//    * If no title is provided its title will be `"Untitled" + this.untitledNumber()`. Its key will be its title. */
//   async newSession(title?: string, src = "index.html"): Promise<Session> {
//     const currentWindow = BrowserWindow.getFocusedWindow();

//     let x, y;
//     if (currentWindow) {
//       const [curX, curY] = currentWindow.getPosition();
//       x = curX + 24;
//       y = curY + 24;
//     }

//     let win = new BrowserWindow({
//       width: Number.parseInt(this.settings.width),
//       height: Number.parseInt(this.settings.height),
//       title: title ? title : `Untitled ${this.untitledNumber()}`,
//       x: x,
//       y: y,
//       webPreferences: {
//         contextIsolation: true,
//         // enableRemoteModule: false,
//         nodeIntegration: false,
//         preload: MAIN_WINDOW_PRELOAD_VITE_ENTRY,
//       },
//     });

//     // Load the new window's index.html file
//     const session = new Session(win, async () => {});
//     session.loadRenderFile(src);

//     win.webContents.on("did-finish-load", () => {
//       if (!win) {
//         throw new Error('"win" is not defined');
//       }

//       if (process.env.START_MINIMIZED) {
//         win.minimize();
//       } else {
//         win.show();
//         win.focus();
//       }
//     });

//     // TODO: Confirm this should work to make sure the correct window is always focused
//     win.on("focus", () => (this.focused = new Some(win.id)));

//     win.on("blur", () => (this.focused = new None()));

//     // @ts-ignore
//     // FIXME: For some reason I do not quite understand this believes it is a window resize event
//     // Delete the window only once it is definitely closed
//     win.on("closed", (_e: Event) => this.sessions.delete(win.id));

//     // this.registerSavePromptOnCloseAttempt(session);

//     win.setMenu(Menu.buildFromTemplate(this.menuTemplate()));

//     this.sessions.set(session.id(), session);
//     return session;
//   }

//   menuTemplate(): MenuTemplate {
//     return [
//       {
//         label: "File",
//         submenu: [
//           {
//             label: "New",
//             accelerator: "CommandOrControl+N",
//             click: (_item, base, _e) => this.get(base?.id as number).loadRenderFile("application.html"),
//           },
//           {
//             label: "New Window",
//             accelerator: "CommandOrControl+Shift+N",
//             click: (_item, base, _e) => this.sessionChange(this.get(base?.id as number), SessionType.Project),
//           },
//           {
//             label: "Open File",
//             accelerator: "CommandOrControl+O",
//             click: (_item, base, _e) => {
//               const win = browserWindowFrom(base as BaseWindow);

//               const session = this.sessions.get(win.id) as Session;
//               session.openFile();
//             },
//           },
//           { type: "separator" },
//           {
//             label: "Save",
//             accelerator: "CommandOrControl+S",
//             click: (_item, base, _e) => {
//               const session = this.sessions.get(base?.id as number) as Session;
//               session.saveFile();
//             },
//           },
//           {
//             label: "Save As",
//             accelerator: "CommandOrControl+Shift+S",
//             click: (_item, base, _e) => {
//               const session = this.sessions.get(base?.id as number) as Session;
//               session.saveFile(true);
//             },
//           },
//           { type: "separator" },
//           {
//             label: "Settings",
//             // Settings can launch a new window which is how MS word handles it
//             click: (_item, base, _e) => this.sessionChange(this.get(base?.id as number), SessionType.Settings),
//           },
//           { type: "separator" },
//           isMac ? { role: "close" } : { role: "quit" },
//         ],
//       },
//       { role: "editMenu" },
//       { role: "viewMenu" },
//     ];
//   }

//   /**Returns the number of untilted sessions in the sessions object */
//   private untitledNumber(): string {
//     let num = 0;

//     this.sessions.forEach((session) => {
//       if (session.getTitle().includes("Untitled")) {
//         num += 1;
//       }
//     });

//     let out;

//     if (num == 0) {
//       out = "";
//     } else {
//       out = num.toString();
//     }
//     return out;
//   }

//   /**Create a new child window. If a new menu is passed it will set it to that. Returns the Window's ID.*/
//   // TODO: Is there a smoother way to do this than passing in sessions?
//   newChildWindow(src: string, parentID: number, menu: MenuTemplate | null, saveFn?: () => Promise<void>, modal = false): number {
//     const parent = this.get(parentID);

//     let childRaw = new BrowserWindow({
//       width: parent.win.getSize()[0] / 2,
//       height: parent.win.getSize()[0] / 2,
//       parent: parent.win,
//       modal: modal,
//       webPreferences: {
//         contextIsolation: true,
//         // enableRemoteModule: false,
//         nodeIntegration: false,
//         preload: MAIN_WINDOW_PRELOAD_VITE_ENTRY,
//       },
//     });

//     const child = new Session(childRaw, async () => {}, saveFn);
//     child.loadRenderFile(src);
//     menu ? child.setMenu(Menu.buildFromTemplate(menu)) : child.setMenu(null);

//     this.sessions.set(child.id(), child);

//     // this.registerSavePromptOnCloseAttempt(child);

//     return child.id();
//   }

//   // /**Registers a function that promps a user to save before exiting a new document or document they have edited. */
//   // registerSavePromptOnCloseAttempt(session: Session) {
//   //   session.win.on("close", (e) => {
//   //     // Session always has a browser window

//   //     if (!session.isClean) {
//   //       e.preventDefault();

//   //       const choice = dialog.showMessageBoxSync(session.win, {
//   //         title: "Confirm",
//   //         message: messages.closeWarning,
//   //         type: "question",
//   //         buttons: ["Yes", "No", "Cancel"],
//   //       });

//   //       if (choice == 0) {
//   //         session.isClean = true;
//   //         session.saveFn();
//   //       } else if (choice == 1) {
//   //         // Just mark clean but no save
//   //         session.isClean = true;
//   //       } else if (choice == 2) {
//   //         return;
//   //       }
//   //     }

//   //     this.closeSession(session.id());
//   //   });
//   // }
// }

// // TODO: Maybe eventually find a way to stick every part of the program into this structure but for now just using it to store file data works
// export class Session {
//   // FIXME: Do not list titles in the loaded pages
//   win: BrowserWindow;
//   // TODO: Don't love initializing it like this maybe it should be an option or undefined
//   savePath;
//   fileData: ListEntry[];
//   opt = new FilterOptions();
//   /**Field indicating whether the session has unsaved changes.*/
//   isClean: boolean;
//   saveFn: () => Promise<void>;
//   shouldClose: boolean;
//   onClose: (args: any) => Promise<void>;

//   constructor(win: BrowserWindow, onClose: (args: any) => Promise<void>, saveFn?: () => Promise<void>) {
//     this.win = win;
//     // Initialize to false so a user is prompted to save before closing
//     this.isClean = false;
//     this.fileData = [];
//     this.savePath = new Path("");
//     this.saveFn = saveFn ? saveFn : this.close;
//     // Each window will need to register its own save handler
//     this.shouldClose = false;
//     this.onClose = onClose;

//     this.win.addListener("close", async (e: Electron.Event) => {
//       if (this.shouldClose) {
//         await this.close();
//       } else {
//         e.preventDefault();
//         this.win.webContents.send("data:request");

//         // this.win.webContents.on("did-finish-load", () => {
//         //   console.log("load done");
//         //   this.win.webContents.send("data:request");
//         // });
//         // this.win.webContents.send("data:request");
//       }
//       // this.win.webContents.send("data:request");
//     });

//     // console.log(this);
//     // console.log(this.onClose);
//   }

//   /**
//    * Try to close the window. This has the same effect as a user manually clicking
//    * the close button of the window. The web page may cancel the close though. See
//    * the close event. Will skip `onClose` behavior.
//    */
//   async close() {
//     console.log("closing functions");
//     this.shouldClose = true;
//     this.win.close();
//   }

//   /**
//    * Try to close the window. This has the same effect as a user manually clicking
//    * the close button of the window. The web page may cancel the close though. See
//    * the close event. Will skip `onClose` behavior.
//    */
//   // TODO: Possibly unneeded
//   closeSync() {
//     this.shouldClose = true;
//     this.win.close();
//   }

//   id(): number {
//     return this.win.id;
//   }

//   // FIXME: This might be unnecessary since the title is only reset by saving and opening a file
//   setTitle(title: string) {
//     this.win.title = title;
//   }

//   getTitle(): string {
//     return this.win.getTitle();
//   }

//   /** Open a new file for the `Session`. */
//   async openFile() {
//     const res = await dialog.showOpenDialog({
//       filters: [
//         { name: "All Files", extensions: ["txt", "json", "xml"] },
//         { name: ".txt", extensions: ["txt"] },
//         { name: ".json", extensions: ["json"] },
//         { name: ".xml", extensions: ["xml"] },
//       ],
//       properties: ["openFile"],
//     });

//     const newPath = res.filePaths[0];

//     // If the action was canceled, abort and return early
//     if (res.canceled || !newPath) {
//       return;
//     }

//     // Update the save path to match the path of the current file
//     // TODO: Should this give an error if it fails?
//     // FIXME: it did not seem like this was saving I think this is because it was an XML
//     // confirm how the json saves and confirm loading it works
//     if (newPath) {
//       this.savePath = new Path(newPath);
//     }

//     const ext = this.savePath.type().unwrap();

//     // TODO: Set the server side list to list before yeeting it back over.
//     let file: SaveFormat;
//     if (ext == ".xml")
//       file = {
//         isAppearances: "DC DATABASE APPEARANCE DATA",
//         opt: new FilterOptions(),
//         data: loadList(this.savePath.toString()),
//       };
//     else {
//       try {
//         // FIXME: My understanding is this catch block should still work but I need to confirm
//         file = sessionFromJSON(this.savePath.toString()) as SaveFormat;
//       } catch (err) {
//         dialog.showErrorBox("Load Failed", (err as Error).message);
//         return;
//       }
//     }

//     // Reflow expects fileData to already be set
//     this.fileData = file.data;
//     this.fileData = this.reflow();

//     // Open the page
//     this.loadRenderFile("application.html");
//     // Send the data over
//     this.win.webContents.on("did-finish-load", () => {
//       this.win.webContents.send("data:response", {
//         opt: file.opt ?? this.opt,
//         data: this.fileData,
//       });
//     });

//     // Set the window name to the title of the file
//     this.win.title = path.basename(this.savePath.toString(), this.savePath.type().unwrap());
//   }

//   /**Save a file to the disk. If `saveas` is  `true` the file operation will be performed as a save as operation.*/
//   async saveFile(saveas = false) {
//     // If there is no save_path set one or if this is explicitly a save as command
//     if (saveas || typeof this.savePath === "undefined" || this.savePath === null) {
//       const res = await dialog.showSaveDialog({
//         // FIXME: Can't be this and openFile figure out the difference
//         properties: ["createDirectory", "showOverwriteConfirmation"],
//         filters: [
//           { name: ".txt", extensions: ["txt"] },
//           { name: ".json", extensions: ["json"] },
//         ],
//       });

//       // Early return if the user cancels
//       if (res.canceled || !res.filePath) return;

//       // Update the save path
//       this.savePath = new Path(res.filePath);

//       // Retitle the window
//       this.win.title = path.basename(res.filePath, this.savePath.type().unwrap());
//     }

//     // FIXME: Unclear if a try/catch block is needed
//     sessionToJSON(this.opt, this.fileData, this.savePath.toString());
//     // If all this completes successfully mark the session as clean (until the next change)
//     this.isClean = true;
//   }

//   /**Recalculate the layout of the results section and return the new layout.*/
//   reflow(): ListEntry[] {
//     let sorted = this.fileData;
//     // TODO: Basically move all this logic serverside
//     switch (this.opt.sortOrder) {
//       case "PUB": {
//         sorted = pubDateSort(this.fileData);
//         break;
//       }
//       case "A-Z": {
//         // TODO: This type of sorting needs to be checked for correctness
//         sorted = sorted.sort((a, b) => {
//           if (a.title < b.title) {
//             return -1;
//           }
//           if (a.title > b.title) {
//             return 1;
//           }
//           return 0;
//         });
//         break;
//       }
//     }

//     // Make sure it does ascendingdescending
//     if (!this.opt.ascending) {
//       sorted = sorted.reverse();
//     }

//     return sorted;
//   }

//   /**Wrapper for this.win.loadFile and this.win.loadURL that uses the appropriate one and path depending on context. DO NOT INCLUDE A DIRNAME JUST THE FILE'S NAME. */
//   loadRenderFile(src = "index.html") {
//     if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
//       // TODO: Don't love having the directory be constant here but this only loads pages so it should be fine
//       this.win.loadURL(`${ROOT_DIRECTORY}/src/renderer/${src}`);
//     } else {
//       this.win.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/${src}`));
//     }
//   }

//   setMenu(menu: Electron.Menu | null) {
//     this.win.setMenu(menu);
//   }

//   // /**Create a new child window. If a new menu is passed it will set it to that. Returns the Window's ID.*/
//   // // TODO: Is there a smoother way to do this than passing in sessions?
//   // newChildWindow(
//   //   src: string,
//   //   sessions: Sessions,
//   //   menu: MenuTemplate | null,
//   //   saveFn?: () => void,
//   //   modal = false,
//   // ): number {
//   //   let childRaw = new BrowserWindow({
//   //     width: this.win.getSize()[0] / 2,
//   //     height: this.win.getSize()[0] / 2,
//   //     parent: this.win,
//   //     modal: modal,
//   //     webPreferences: {
//   //       contextIsolation: true,
//   //       // enableRemoteModule: false,
//   //       nodeIntegration: false,
//   //       preload: MAIN_WINDOW_PRELOAD_VITE_ENTRY,
//   //     },
//   //   });

//   //   const child = new Session(sessions, childRaw, saveFn);
//   //   child.loadRenderFile(src);
//   //   menu ? child.setMenu(Menu.buildFromTemplate(menu)) : child.setMenu(null);

//   //   sessions.sessions.set(child.id(), child);

//   //   return child.id();
//   // }
// }

// enum SessionType {
//   Project,
//   Launcher,
//   Settings,
// }

// function browserWindowFrom(base: BaseWindow): BrowserWindow {
//   const win = BrowserWindow.fromId(base.id);
//   if (win) return win;
//   else throw new Error(`Window ${base?.id} does not exist.`);
// }
