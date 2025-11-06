import { BrowserWindow, dialog, Menu, nativeTheme } from "electron";
import { ListEntry, pubDateSort } from "../../core/pub-sort";
import path from "path";
import { SaveFormat, loadList, sessionFromJSON, sessionToJSON } from "../../core/load";
import { AppPage, FilterOptions, Settings } from "../common/apiTypes";
import { None, Some, Option } from "../../core/option";
import fs, { PathLike } from "fs";
import { MenuTemplate, openFileDialog } from "./menu";
import { __userdata, IS_DEV } from "./helpers";

export declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
export declare const MAIN_WINDOW_VITE_NAME: string;
/**Address of the root directory */
export const ROOT_DIRECTORY = IS_DEV ? MAIN_WINDOW_VITE_DEV_SERVER_URL : __dirname;

// FIXME: It does not seem as if vite supports this for vite as it does webpack but maybe they will eventually
export const MAIN_WINDOW_PRELOAD_VITE_ENTRY = path.join(__dirname, `preload.js`);

// TODO: Maybe eventually find a way to stick every part of the program into this structure but for now just using it to store file data works
export class Session {
  win: BrowserWindow;
  savePath: Path;
  fileData: ListEntry[];
  opt: FilterOptions;
  /**Field indicating whether the `Session` has unsaved changes.*/
  isClean: {
    task: boolean;
    settings: boolean;
  };
  saveFn: () => Promise<void>;
  shouldClose: boolean;
  onClose: (args: any) => Promise<void>;
  settings: Settings;

  constructor(onClose: (args: any) => Promise<void>, saveFn?: () => Promise<void>) {
    const settings = Session.getSettings();

    this.win = Session.makeWindow(settings);
    this.opt = new FilterOptions();
    // Only mark dirty once a task is open
    this.isClean = { settings: true, task: true };
    this.fileData = [];
    this.savePath = new Path();
    this.settings = settings;
    // Each window will need to register its own save handler
    this.saveFn = saveFn ? saveFn : this.close;
    this.shouldClose = false;
    this.onClose = onClose;

    // Basically this needs to run after all the fields are set up
    this.navigateToPage();
    this.win.setMenu(Menu.buildFromTemplate(MenuTemplate(this)));
  }

  /**Applies current settings file to all windows and updates the settings field.*/
  updateSettings(settings: Settings) {
    this.applySettings(settings);
    this.settings = settings;
  }

  /**Applys current settings file to all windows. \
   * Does not update the settings field. */
  applySettings(settings: Settings) {
    // Theme
    nativeTheme.themeSource = settings.theme;
    // Update size
    this.win.setSize(Number.parseInt(settings.width), Number.parseInt(settings.width));

    // Changing the dropdown is a little more annoying
    //  I need to swap out an HTML component on the fly

    this.isClean.settings = false;
  }

  /**Saves the `Sessions` current `settings` field to disk. */
  async saveSettings() {
    // settingsSess.win.webContents.send("settings");

    const file = JSON.stringify(this.settings);

    // In dev, save to dev settings folder
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      fs.writeFileSync("settings.json", file);
    } else {
      // If there is no userdata folder make one and add the settings to
      if (!fs.existsSync(`${__userdata}/DCDB Appearances/`)) {
        fs.mkdirSync(`${__userdata}/DCDB Appearances/`);
      }
      fs.writeFileSync(`${__userdata}/DCDB Appearances/settings.json`, file);
    }

    this.isClean.settings = true;
  }

  private static makeWindow(settings: Settings): BrowserWindow {
    let win = new BrowserWindow({
      width: Number.parseInt(settings.width),
      height: Number.parseInt(settings.height),
      // FIXME: Cycle through the number tabs once number of tabs is a thing
      title: "Untitled",
      webPreferences: {
        contextIsolation: true,
        // enableRemoteModule: false,
        nodeIntegration: false,
        preload: MAIN_WINDOW_PRELOAD_VITE_ENTRY,
      },
    });

    win.webContents.on("did-finish-load", () => {
      if (!win) {
        throw new Error('"win" is not defined');
      }

      if (process.env.START_MINIMIZED) {
        win.minimize();
      } else {
        win.show();
        win.focus();
      }
    });

    return win;
  }

  private static getSettings(): Settings {
    // FIXME: There should be a way to have it make a settings file if there is none
    // Maybe that can be done as part of the installation process?

    // Skip the production stuff below if we're in dev
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      // @ts-ignore
      return JSON.parse(fs.readFileSync("settings.json")) as Settings;
    } else {
      // If there is no userdata folder make one and add the settings to
      if (!fs.existsSync(`${__userdata}/DCDB Appearances/`)) {
        fs.mkdirSync(`${__userdata}/DCDB Appearances/`);
        // Copy the default settings file into userdata
        fs.copyFileSync("settings.json", __userdata);
      }

      // @ts-ignore
      return JSON.parse(fs.readFileSync(`${__userdata}/DCDB Appearances/settings.json`)) as Settings;
    }
  }

  /**
   * Try to close the window. This has the same effect as a user manually clicking
   * the close button of the window. The web page may cancel the close though. See
   * the close event. Will skip `onClose` behavior.
   */
  async close() {
    console.log("closing functions");
    this.shouldClose = true;
    this.win.close();
  }

  id(): number {
    return this.win.id;
  }

  // FIXME: This might be unnecessary since the title is only reset by saving and opening a file
  setTitle(title: string) {
    this.win.title = title;
  }

  getTitle(): string {
    return this.win.getTitle();
  }

  /** Open a new file for the `Session`. */
  async openFile() {
    const res = await openFileDialog();

    const newPath = res.filePaths[0];

    // If the action was canceled, abort and return early
    if (res.canceled || !newPath) {
      return;
    }

    // Update the save path to match the path of the current file
    // TODO: Should this give an error if it fails?
    if (newPath) {
      this.savePath = new Path(newPath);
    }

    const ext = this.savePath.type().unwrap();

    // TODO: Set the server side list to list before yeeting it back over.
    let file: SaveFormat;
    if (ext == ".xml")
      file = {
        isAppearances: "DC DATABASE APPEARANCE DATA",
        opt: new FilterOptions(),
        data: loadList(this.savePath.toString()),
      };
    else {
      try {
        // FIXME: My understanding is this catch block should still work but I need to confirm
        file = sessionFromJSON(this.savePath.toString()) as SaveFormat;
      } catch (err) {
        dialog.showErrorBox("Load Failed", (err as Error).message);
        return;
      }
    }

    // Reflow expects fileData to already be set
    this.fileData = file.data;
    this.fileData = this.reflow();

    // Open the page
    this.navigateToPage(AppPage.from(this.savePath.toString()));
    // Send the data over
    this.win.webContents.on("did-finish-load", () => {
      this.win.webContents.send("file-opened", {
        opt: file.opt ?? this.opt,
        data: this.fileData,
      });
    });

    // Set the window name to the title of the file
    this.win.title = path.basename(this.savePath.toString(), this.savePath.type().unwrap());
  }

  /**Save a file to the disk. If `saveas` is  `true` the file operation will be performed as a save as operation.*/
  async saveFile(saveas = false) {
    // If there is no save_path set one or if this is explicitly a save as command
    if (saveas || typeof this.savePath === "undefined" || this.savePath === null) {
      const res = await dialog.showSaveDialog({
        // FIXME: Can't be this and openFile figure out the difference
        properties: ["createDirectory", "showOverwriteConfirmation"],
        filters: [
          { name: ".txt", extensions: ["txt"] },
          { name: ".json", extensions: ["json"] },
        ],
      });

      // Early return if the user cancels
      if (res.canceled || !res.filePath) return;

      // Update the save path
      this.savePath = new Path(res.filePath);

      // Retitle the window
      this.win.title = path.basename(res.filePath, this.savePath.type().unwrap());
    }

    // FIXME: Unclear if a try/catch block is needed
    sessionToJSON(this.opt, this.fileData, this.savePath.toString());
    // If all this completes successfully mark the session as clean (until the next change)
    this.isClean.task = true;
  }

  /**Recalculate the layout of the results section and return the new layout.*/
  reflow(): ListEntry[] {
    let sorted = this.fileData;
    // TODO: Basically move all this logic serverside
    switch (this.opt.sortOrder) {
      case "PUB": {
        sorted = pubDateSort(this.fileData);
        break;
      }
      case "A-Z": {
        // TODO: This type of sorting needs to be checked for correctness
        sorted = sorted.sort((a, b) => {
          if (a.title < b.title) {
            return -1;
          }
          if (a.title > b.title) {
            return 1;
          }
          return 0;
        });
        break;
      }
    }

    // Make sure it does ascendingdescending
    if (!this.opt.ascending) {
      sorted = sorted.reverse();
    }

    return sorted;
  }
  /**Replace the current window content with content for another page
   * Wrapper for this.win.loadFile and this.win.loadURL that uses the appropriate one and path depending on context.
   * DO NOT INCLUDE A DIRNAME JUST THE FILE'S NAME.
   * Loads `index.html` by default.
   * */
  navigateToPage(src = AppPage.StartPage) {
    if (IS_DEV) {
      // TODO: Don't love having the directory be constant here but this only loads pages so it should be fine
      this.win.loadURL(`${ROOT_DIRECTORY}/src/renderer/${src}`);
    } else {
      // TODO: Doublecheck
      this.win.loadFile(path.join(ROOT_DIRECTORY, `../renderer/${MAIN_WINDOW_VITE_NAME}/${src}`));
    }
  }

  setMenu(menu: Electron.Menu | null) {
    this.win.setMenu(menu);
  }
}

// TODO: Do I actually really need this? If I need it is there a way I can add it to the real path instead of doing this?
class Path {
  private path: string;

  constructor(pathStr?: PathLike) {
    // FIXME: Confirm it is a valid path and error if not
    this.path = pathStr ? pathStr.toString() : "";
  }

  /**Returns the name of a path's file if it has one */
  fileName(): Option<string> {
    const name = path.basename(this.path);

    if (typeof name == "undefined") {
      return new None();
    } else {
      return new Some(name);
    }
  }

  /**Returns the filetype of the file the path references. Returns None if there is no extension. */
  type(): Option<string> {
    const ty = path.extname(this.path);
    if (ty == "") {
      return new None();
    } else {
      return new Some(ty);
    }
  }

  toString() {
    return this.path.toString();
  }
}
