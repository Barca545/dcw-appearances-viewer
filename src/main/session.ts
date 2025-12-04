import { app, BrowserWindow, dialog, Menu, nativeTheme } from "electron";
import { ListEntry, pubDateSort } from "../../core/pub-sort";
import path from "path";
import { ProjectData, loadList, ProjectDataFromJSON, saveProjectDataAsJSON, Path } from "../../core/load";
import { AppPage, FilterOptions, Settings, SortOrder } from "../common/apiTypes";
import fs from "fs";
import { MenuTemplate, openFileDialog } from "./menu";
import { __userdata, IS_DEV, ROOT_DIRECTORY, MESSAGES, RESOURCE_PATH, UNIMPLEMENTED_FEATURE } from "./main_utils";
import { None, Option, Some } from "../../core/option";

export declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
export declare const MAIN_WINDOW_VITE_NAME: string;

// FIXME: It does not seem as if vite supports this for vite as it does webpack but maybe they will eventually
export const MAIN_WINDOW_PRELOAD_VITE_ENTRY = path.join(__dirname, `preload.js`);

// TODO: Maybe eventually find a way to stick every part of the program into this structure but for now just using it to store file data works
export class Session {
  win: BrowserWindow;
  savePath: Option<Path>;
  projectData: ProjectData;
  opt: FilterOptions;
  /**Field indicating whether the `Session` has unsaved changes.*/
  isClean: {
    task: boolean;
    settings: boolean;
  };
  settings: Settings;

  constructor() {
    const settings = Session.getSettings();
    this.win = Session.makeWindow(settings);
    this.opt = new FilterOptions();
    this.projectData = ProjectData.empty();
    // Start the app save path as home
    this.savePath = new None();
    this.settings = settings;
    // Only mark dirty once a task is open
    // This means the landing page won't count as a document edit
    // However opening a project will because reflow marks as dirty and opening a project calls reflow
    this.isClean = { settings: true, task: true };

    // Basically this needs to run after all the fields are set up
    this.openAppPage();
    this.win.setMenu(Menu.buildFromTemplate(MenuTemplate(this)));

    // Register listeners
    this.win.on("close", (e) => {
      // Check whether a save is needed
      if (!this.isClean.task) {
        e.preventDefault();
        this.unsavedChangesPrompt();
      }
      if (!this.isClean.settings) {
        UNIMPLEMENTED_FEATURE();
      }
    });
  }

  unsavedChangesPrompt() {
    // FIXME: It's possible however I do tabs won't work with this but...
    // App will only have one window so that will always be the focused window
    const options = {
      title: "Unsaved Changes",
      message: MESSAGES.unsavedChanges,
      type: "question",
      buttons: ["Save", "Don't Save", "Cancel"],
      noLink: true,
    } as Electron.MessageBoxOptions;
    switch (dialog.showMessageBoxSync(this.win, options)) {
      case 0: {
        // Open save dialog
        this.saveFile(false);
        break;
      }
      case 1: {
        // Exit without saving
        this.isClean.task = true;
        this.win.close();
        break;
      }
      default:
        // Close the dialog, cancel close attempt
        break;
    }
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
    // TODO: DO this if then where root directory is defined and then just use that everywhere
    if (IS_DEV) {
      fs.writeFileSync(path.join(ROOT_DIRECTORY, "settings.json"), file, { encoding: "utf-8" });
    } else {
      fs.writeFileSync(path.join(__userdata, "settings.json"), file, { encoding: "utf-8" });

      this.isClean.settings = true;
    }
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
    const settingsSrc = path.join(RESOURCE_PATH, "settings.json");
    // Skip the production stuff below if we're in dev
    if (IS_DEV) {
      return JSON.parse(fs.readFileSync(settingsSrc, { encoding: "utf-8" })) as Settings;
    } else {
      // Load settings
      const settings = fs.readFileSync(path.join(__userdata, "settings.json"), { encoding: "utf-8" });

      return JSON.parse(settings) as Settings;
    }
  }

  /**
   * Try to close the window. This has the same effect as a user manually clicking
   * the close button of the window. The web page may cancel the close though. See
   * the close event. Will skip `onClose` behavior.
   */
  async close() {
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
    const res = openFileDialog();

    // If the action was canceled, abort and return early
    if (res.isNone()) {
      // FIXME: This needs to error and say the path does not exist
      return;
    }

    const newPath = res.unwrap();

    // Update the save path to match the path of the current file
    // TODO: Should this give an error if it fails?
    if (newPath) {
      this.savePath = new Some(new Path(newPath));
    }

    // We know it is valid by the time we reach here because we set and checked it above
    const ext = this.savePath.unwrap().ext();

    // TODO: Set the server side list to list before yeeting it back over.
    let file: ProjectData;
    if (ext == ".xml")
      file = {
        header: { appID: "DCDB-Appearance-Viewer", version: app.getVersion() },
        meta: { options: new FilterOptions() },
        data: loadList(this.savePath.unwrap()),
      };
    else if (ext == ".json") {
      try {
        // FIXME: My understanding is this catch block should still work but I need to confirm
        file = ProjectDataFromJSON(this.savePath.unwrap()) as ProjectData;
      } catch (err) {
        dialog.showErrorBox("Load Failed", (err as Error).message);
        return;
      }
    } else {
      dialog.showErrorBox("Load Failed", MESSAGES.illegalFileType);
      return;
    }

    // Reflow expects fileData to already be set
    this.projectData = file;
    this.projectData.data = this.reflow();

    // Open the page
    this.openAppPage(AppPage.Application);
    // Send the data over
    this.win.webContents.on("did-finish-load", () => {
      // TODO: Why use this instead of ipcMain?
      this.win.webContents.send("data:response", file);
    });

    // Set the window name to the title of the file
    this.win.title = this.savePath.unwrap().fileName();
  }

  /**Save a file to the disk. If `saveas` is  `true` the file operation will be performed as a save as operation.*/
  async saveFile(shouldPrompt: boolean) {
    // If there is no save_path set one or if this is explicitly a save as command
    if (shouldPrompt || this.savePath.isNone()) {
      const res = await dialog.showSaveDialog({
        defaultPath: app.getPath("documents"),
        // FIXME: Can't be this and openFile figure out the difference
        properties: ["createDirectory", "showOverwriteConfirmation"],
        filters: [
          // I don't really think there is a reason to add txt saving since JSONs are plaintext but maybe
          { name: ".json", extensions: ["json"] },
        ],
      });

      // Early return if the user cancels
      if (res.canceled || !res.filePath) return;

      // Update the save path
      this.savePath = new Some(new Path(res.filePath));

      // Retitle the window
      this.win.title = path.basename(res.filePath, this.savePath.unwrap().ext());
    }

    // FIXME: Unclear if a try/catch block is needed
    saveProjectDataAsJSON(this.projectData, this.savePath.unwrap());
    // If all this completes successfully mark the session as clean (until the next change)
    this.isClean.task = true;
  }

  /**Recalculate the layout of the results section and return the new layout.*/
  // TODO:  Maybe this can be part of a bigger update function or something
  // This being where the isDirty flag is reset feels awkward
  reflow(): ListEntry[] {
    let sorted = this.projectData.data;
    // TODO: Basically move all this logic serverside
    switch (this.opt.order) {
      case SortOrder.PubDate: {
        sorted = pubDateSort(sorted);
        break;
      }
      case SortOrder.AlphaNumeric: {
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

    // FIXME: Not sure I love this here
    // Mark the file as needing a save
    this.isClean.task = false;

    return sorted;
  }

  /**Reset the current tab to the blank tab state. */
  resetTab() {
    this.projectData = ProjectData.empty();
    this.opt = new FilterOptions();
    this.savePath = new None();
    this.isClean = { settings: true, task: true };
  }

  /**Replace the current tab's content with content for another AppPage.
   * Wrapper for this.win.loadFile and this.win.loadURL that uses the appropriate one and path depending on context.
   * DO NOT INCLUDE A DIRNAME JUST THE FILE'S NAME.
   * */
  openAppPage(src = AppPage.Index) {
    // If it is currently an Application page, it should save before exiting and then wipe all old data
    // Include a check because when the page initially loads because on startup the app has no loaded page
    if (this.win.webContents.getURL() && AppPage.from(this.win.webContents.getURL()).unwrap() == AppPage.Application) {
      this.saveFile(false);
      this.resetTab();
    }
    if (IS_DEV) {
      // TODO: Don't love having the directory be constant here but this only loads pages so it should be fine
      this.win.loadURL(`${ROOT_DIRECTORY}/src/renderer/${src}`);
    } else {
      const filePath = path.join(__dirname, "..", "renderer", MAIN_WINDOW_VITE_NAME, "src", "renderer", `${src}`);

      this.win.loadFile(filePath);
    }
  }

  setMenu(menu: Electron.Menu | null) {
    this.win.setMenu(menu);
  }
}
