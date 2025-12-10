import { loadList, Path, ProjectData, ProjectDataFromJSON } from "../../core/load";
import { None, Option, Some } from "../../core/option";
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import path from "node:path";
import { DEFAULT_FILTER_OPTIONS, DisplayDensity, DisplayDirection, DisplayOrder } from "../common/apiTypes";
import { MAIN_WINDOW_PRELOAD_VITE_ENTRY } from "./devTypes";
import { RESOURCE_PATH, IS_DEV, __userdata, MESSAGES, UNIMPLEMENTED_FEATURE, IS_MAC } from "./main_utils";
import fs from "node:fs";
import type {
  DataTab,
  DisplayOrderUpdate,
  DisplayDensityUpdate,
  DisplayDirectionUpdate,
  SearchRequest,
  SerializedAppTab,
  SerializedSettingsTab,
  Settings,
  SettingsUpdate,
  Tab,
  TabData,
  TabID,
  TabStaticInterface,
} from "../common/TypesAPI";
import { openFileDialog } from "./menu";
import { pubDateSort } from "../../core/pub-sort";
import { createCharacterName } from "../common/utils";
import { fetchList } from "../../core/fetch";
import { APIEvent, APIEventMap } from "../common/ipcAPI";

declare global {
  const APPID = "DCDB-Appearance-Viewer";
}

// TODO: This definitely belongs somewhere else
function staticImplements<T>() {
  return <U extends T>(constructor: U) => {
    constructor;
  };
}

@staticImplements<TabStaticInterface>()
export class SettingsTab implements DataTab {
  meta: { ID: TabID; tabName: "Settings" };
  // FIXME: Since the session also stores settings, I don't like having settings in two places
  // TODO: Needs to store old settings so saving without saving reapplies old settings
  data: Settings;
  isClean: boolean;
  savePath: Path;

  private constructor() {
    this.meta = { ID: crypto.randomUUID(), tabName: "Settings" };
    this.data = SettingsTab.getSettings();
    this.isClean = true;
    this.savePath = new Path(app.getPath("userData"), "settings.json");
  }
  serialize(): SerializedSettingsTab {
    return {
      success: false,
      meta: this.meta,
      settings: this.data,
    };
  }

  static default(): SettingsTab {
    return new SettingsTab();
  }

  private static getSettings(): Settings {
    if (IS_DEV) {
      return JSON.parse(fs.readFileSync(path.join(RESOURCE_PATH, "settings.json"), { encoding: "utf-8" })) as Settings;
    } else {
      return JSON.parse(fs.readFileSync(path.join(__userdata, "settings.json"), { encoding: "utf-8" })) as Settings;
    }
  }
}

@staticImplements<TabStaticInterface>()
export class StartTab implements Tab {
  meta: { ID: TabID; tabName: "Start" };
  savePath: None<Path>;

  constructor(ID: TabID) {
    this.meta = { ID, tabName: "Start" };
    this.savePath = new None();
  }

  /**Create a settings page with `TabType==Settings`.*/
  static default(): StartTab {
    return new StartTab({
      meta: { ID: crypto.randomUUID(), tabName: "Settings" },
    });
  }
}

@staticImplements<TabStaticInterface>()
/**Main process-side representation.
 * @field meta: Metadata identifying the tab and its contents.
 * @field isClean: Field indicating whether the `SessionTab` has unsaved changes.
 */
export class AppTab implements DataTab {
  // TODO: maybe "meta" should be made an interface since I reuse it like 3 places
  meta: { ID: TabID; tabName: string; characterName: string };
  savePath: Option<Path>;
  /**Indicates whether the tab has unsaved changes. */
  isClean: boolean;
  data: ProjectData;

  private constructor(args: { meta: { ID: TabID; tabName: string }; savePath: Option<Path>; projectData: ProjectData }) {
    this.meta = { ID: args.meta.ID, tabName: args.meta.tabName, characterName: "" };
    this.isClean = true;
    this.savePath = args.savePath;
    this.data = args.projectData;
  }

  /** Create an empty page with `TabType==App`.*/
  static default(args: { meta: { ID: TabID; tabName: string }; savePath: Option<Path> }): AppTab {
    return new AppTab({
      meta: { ID: args.meta.ID, tabName: args.meta.tabName },
      savePath: args.savePath,
      projectData: ProjectData.default(),
    });
  }

  static new(args: { meta: { ID: TabID; tabName: string }; savePath: Option<Path>; projectData: ProjectData }): AppTab {
    return new AppTab(args);
  }

  /**Serializes the information in the tab as `TabData`.  */
  serialize(): SerializedAppTab {
    return {
      success: false,
      meta: this.meta,
      appearances: this.data.list.map((entry) => entry.toAppearanceData()),
      options: this.data.meta.opts,
    };
  }

  /**Load `ProjectData` from a file. Reflowing is unnecessary as it is assumed the file was reflowed according to its saved `FilterOptions`.*/
  static LoadProjectData(savePath: Path): ProjectData {
    switch (savePath.ext()) {
      case ".xml": {
        return AppTab._reflow(
          ProjectData.from({
            header: { appID: APPID, version: app.getVersion() },
            meta: { character: "", title: savePath.name(), opts: DEFAULT_FILTER_OPTIONS },
            list: loadList(savePath),
          }),
        );
      }
      case ".json": {
        try {
          AppTab._reflow(ProjectDataFromJSON(savePath));
        } catch (err) {
          dialog.showErrorBox("Load Failed", (err as Error).message);
          return ProjectData.default();
        }
      }
      default: {
        dialog.showErrorBox("Load Failed", MESSAGES.illegalFileType);
        return ProjectData.default();
      }
    }
  }

  /** Reorder the tab's data's list according to its `FilterOptions`. Mutates in place.*/
  reflow() {
    AppTab._reflow(this.data);
    // Mark the file as needing a save
    this.isClean = false;
  }

  /** Reorder the data's list according to the `FilterOptions`. Returns the mutated data.*/
  static _reflow(data: ProjectData): ProjectData {
    switch (data.meta.opts.order) {
      case DisplayOrder.PubDate: {
        data.list = pubDateSort(data.list);
        break;
      }
      case DisplayOrder.AlphaNumeric: {
        // TODO: This type of sorting needs to be checked for correctness
        data.list.sort((a, b) => {
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

    // Make sure it does ascending/descending
    if (!data.meta.opts.ascending) {
      data.list.reverse();
    }

    return data;
  }

  /**Update the tab's `ProjectData`'s display order and reflow the list. */
  updateDisplayOrder(update: DisplayOrder) {
    this.data.meta.opts.order = update;
    this.reflow();
  }

  /**Update the tab's `ProjectData`'s display density and reflow the list. */
  updateDisplayDensity(update: DisplayDensity) {
    this.data.meta.opts.density = update;
    this.reflow();
  }

  /**Update the tab's `ProjectData`'s display directon and reflow the list. */
  updateDisplayDirection(update: DisplayDirection) {
    this.data.meta.opts.ascending = update;
    this.reflow();
  }
}

export class Session {
  win: BrowserWindow;
  settings: Settings;
  tabs: Map<TabID, Tab>;
  current: TabID;

  constructor() {
    const startID = crypto.randomUUID();
    const settings = Session.getSettings();
    this.win = Session.makeWindow(settings);
    this.settings = settings;
    this.tabs = new Map([[startID, StartTab.default()]]);
    this.current = startID;
  }

  /**Creates a new empty `AppTab`. Returns the tab's \[empty\] `ProjectData`.*/
  newAppTab(): AppTab {
    const tab = AppTab.default({
      meta: {
        ID: crypto.randomUUID(),
        // This function will return a tab with the name "Untitled + <Number of Untitled Tabs>"
        tabName: `Untitled ${this.tabs.entries().reduce((acc, tab) => {
          return tab[1].meta.tabName.includes("Untitled") ? acc + 1 : acc;
        }, 0)}`,
      },
      savePath: new None(),
    });

    this.tabs.set(tab.meta.ID, tab);

    return tab;
  }

  /** Load a file's `ProjectData` into a new tab. Returns an Option containing the file data if the load completes.*/
  newAppTabFromFile(): Option<AppTab> {
    const res = openFileDialog();

    // If the action was canceled, abort and return early
    if (res.isNone()) {
      return new None();
    }

    const data = AppTab.LoadProjectData(new Path(res.unwrap()));

    const tab = AppTab.new({
      meta: {
        ID: crypto.randomUUID(),
        tabName: data.meta.title,
      },
      // We know it is valid by the time we reach here because we checked it with res.isNone() above
      savePath: new Some(new Path(res.unwrap())),
      projectData: data,
    });

    this.tabs.set(tab.meta.ID, tab);

    return new Some(tab);
  }

  // TODO: Opening up a new tab from the renderer can also call this
  /** Open a new tab with the requested information. Returns the `Tab`. */
  openAppTab(fromFile: boolean): Tab {
    // Save the current tab, if one is open
    this.saveFile(false);
    const tab = fromFile ? this.newAppTabFromFile().unwrap() : this.newAppTab();
    this.current = tab.meta.ID;

    // Send the data to the renderer
    this.sendIPC(APIEvent.TabUpdate, tab.serialize());
    // TODO: Add a TabGo event
    this.sendIPC(APIEvent.TabGo, tab.meta.ID);
    return tab;
  }

  /**Save a tab's `ProjectData` and mark the tab as clean. If no id is provided, defaults to the current tab.*/
  saveFile(mustSaveAs: boolean, id?: TabID) {
    // Confirm tab is not a start tab
    const tab = this.tabs.get(id ? id : this.current);
    if (!tab) {
      // TODO: This probalby needs to be stuck in messages although I am not sure when this case would happen
      // TODO: This probably also should be logged as an error
      alert(`Tab with ID ${this.current} does not exist!`);
      return;
    } else if (tab instanceof StartTab) {
      return;
    }

    // If there is no save_path or if this is explicitly a save as command update the save path.
    if (mustSaveAs || tab.savePath.isNone()) {
      const res = dialog.showSaveDialogSync({
        defaultPath: app.getPath("documents"),
        // FIXME: Can't be this and openFile figure out the difference
        properties: ["createDirectory", "showOverwriteConfirmation"],
        filters: [
          // I don't really think there is a reason to add txt saving since JSONs are plaintext but maybe
          { name: ".json", extensions: ["json"] },
        ],
      });

      // Early return if the user cancels
      if (res == "") return;

      // Update the save path
      tab.savePath = new Some(new Path(res));
    }

    if (tab instanceof AppTab) {
      tab.data.saveAsJSON(tab.savePath.unwrap());
      tab.isClean = true;
    } else if (tab instanceof SettingsTab) {
      UNIMPLEMENTED_FEATURE();
      throw new Error("Saving Settings is not implemented yet");
    }
  }

  private static makeWindow(settings: Settings): BrowserWindow {
    let win = new BrowserWindow({
      width: Number.parseInt(settings.width),
      height: Number.parseInt(settings.height),
      titleBarStyle: "hidden",
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

  /**Tell the renderer to change the current tab. */
  changeTab() {
    this.win.webContents.emit("nav:go", this.current);
  }

  /**Close all open tabs then close the window.*/
  close() {
    // Keys to remove
    // TODO: This feels dangerous since I am theoretically iterating over something while modifying it
    // In Rust, it would be easy to tell if this was illegal but TS does not care to tell
    for (const id in this.tabs.keys()) {
      let tab = this.tabs.get(id as TabID) as Tab;

      // If the user cancels closing a tab abort the close process
      if (!this.closeTab(tab.meta.ID)) {
        break;
      }
    }

    // If there are no more tabs open, close the actual application
    if (this.tabs.size == 0) {
      this.win.close();
    }
  }

  /**Attempt to close a tab.
   * Removes the tab from the `Session` and Renderer's tab lists.
   * Prompt the user for how to handle an unsaved tab.
   * @returns `true` if the tab is prepared to close.
   * @returns `false` if the process was aborted. */
  closeTab(id: TabID): boolean {
    const tab = this.tabs.get(id);
    if (tab instanceof StartTab) {
      return true;
    } else if ((tab instanceof AppTab || tab instanceof SettingsTab) && !tab.isClean) {
      const res = dialog.showMessageBoxSync(this.win, {
        title: "Unsaved Changes",
        message: MESSAGES.unsavedChanges,
        type: "question",
        buttons: ["Save", "Don't Save", "Cancel"],
        noLink: true,
      });

      switch (res) {
        case 0: {
          this.saveFile(false, id);
          this.closeTab(id);
          return true;
        }
        case 1: {
          tab.isClean = true;
          if (tab instanceof SettingsTab) {
            throw new Error("Settings tab does not currently restore session settings on exit.");
          }
          this.closeTab(id);
          return true;
        }
        default: {
          return false;
        }
      }
    } else {
      // If it is not a start tab and it is not dirty, close the tab
      this.win.webContents.emit("tab:close", id as TabID);
      this.tabs.delete(id as TabID);
      return true;
    }
  }

  /**Update the character of a tab.
   * Errors if the tab does not exist or is not an AppTab.
   * Returns the tab's `TabData` after the update.*/
  async updateTabCharacter(req: SearchRequest): Promise<TabData> {
    const tab = this.tabs.get(req.id);
    // TODO: These errors need to log properly
    if (!tab) {
      throw new Error(`Tab ${req.id} does not exist.`);
    }
    if (!(tab instanceof AppTab)) {
      const tabType = tab instanceof SettingsTab ? "SettingsTab" : "StartTab";
      throw new Error(`Cannot update tab ${req.id} as it is a ${tabType} tab not an AppTab`);
    }
    tab.meta.characterName = createCharacterName(req);
    const res = await fetchList(tab.meta.characterName);
    tab.data.list = res.unwrap_or([]);
    tab.isClean = false;

    return {
      success: res.is_ok(),
      meta: tab.meta,
      appearances: tab.data.list.map((entry) => entry.toAppearanceData()),
      options: tab.data.meta.opts,
    } as TabData;
  }

  updateDisplayOrder(update: DisplayOrderUpdate) {
    let tab = this.tabs.get(update.id) as AppTab;

    tab.updateDisplayOrder(update.order);

    this.sendIPC(APIEvent.TabUpdate, tab.serialize());
  }

  updateDisplayDensity(update: DisplayDensityUpdate) {
    let tab = this.tabs.get(update.id) as AppTab;

    tab.updateDisplayDensity(update.density);

    this.sendIPC(APIEvent.TabUpdate, tab.serialize());
  }

  updateDisplayDirection(update: DisplayDirectionUpdate) {
    let tab = this.tabs.get(update.id) as AppTab;

    tab.updateDisplayDirection(update.dir);

    this.sendIPC(APIEvent.TabUpdate, tab.serialize());
  }

  /**Apply the update to the current session without saving it to userdata.
   *
   * Send the changes to the renderer.*/
  applySettings(update: SettingsUpdate) {
    const tab = this.tabs.get(update.id) as SettingsTab;
    throw new Error("Session::applySettings is unimplemented");
  }

  /**Apply the update to the current session and save it to userdata.
   *
   * Send the changes to the renderer. */
  saveSettings(update: SettingsUpdate) {
    this.applySettings(update);
    throw new Error("Session::saveSettings is unimplemented");
  }

  sendIPC<K extends keyof APIEventMap>(type: K, payload: APIEventMap[K]) {
    this.win.webContents.send(type, payload);
  }

  /**Register `IPC` event handlers for communication between the renderer and main process*/
  async initListeners() {
    // FIXME: Fix MAC behavior, really I want to just make it so that closing the window closes the app
    // damn expected MAC behavior

    // Activating the app when no windows are available should open a new one.
    // This listener gets added because MAC keeps the app running even when there are no windows
    // so you need to listen for a situation where the app should be active but there are no windows open
    // app.on("activate", () => {
    //   if (BrowserWindow.getAllWindows().length === 0) {
    //     sessions.newSession();
    //   }
    // });

    // This must be created after the app is ready

    // MAC BEHAVIOR
    // Quit the application when all windows are closed
    ipcMain.on("window-all-closed", () => {
      if (!IS_MAC) app.quit();
    });

    this.win.on("close", (e) => {
      e.preventDefault();
      this.close();
    });
    this.win.on("blur", () => this.saveFile(false));

    // NAVIGATION LISTENERS
    // TODO: Implement the other two tabs
    // TODO: I think all that's left here is to emit a TabGo event which could arguably happen inside the open
    ipcMain.handle(APIEvent.OpenPage, () => {
      const tab = this.openAppTab(false);

      if (tab instanceof AppTab) {
        // Tell the renderer to navigate to the tab
      } else if (tab instanceof StartTab) {
        UNIMPLEMENTED_FEATURE();
        throw new Error("Opening Start tab is not implemented yet");
      } else {
        UNIMPLEMENTED_FEATURE();
        throw new Error("Opening a new Settings tab is not implemented yet");
      }
    });

    ipcMain.on(APIEvent.OpenFile, () => this.openAppTab(true));
    ipcMain.on(APIEvent.OpenURL, (_e, url: string) => shell.openExternal(url));

    // SEARCHING FOR CHARACTERS AND REFLOW LISTENERS
    ipcMain.handle(APIEvent.TabRequest, async (_e, req: SearchRequest) => this.updateTabCharacter(req));
    ipcMain.on(APIEvent.TabClose, (_e, id: TabID) => this.closeTab(id));

    // SETTINGS LISTENERS
    ipcMain.handle(APIEvent.SettingsRequest, () => this.settings);
    ipcMain.on(APIEvent.SettingsApply, (_e, settings: SettingsUpdate) => this.applySettings(settings));
    ipcMain.on(APIEvent.SettingsSave, (_e, settings: SettingsUpdate) => this.saveSettings(settings));

    // DISPLAY STYLE LISTENERS
    ipcMain.on(APIEvent.FilterOrder, (_e, order: DisplayOrderUpdate) => this.updateDisplayOrder(order));
    ipcMain.on(APIEvent.FilterDensity, (_e, density: DisplayDensityUpdate) => this.updateDisplayDensity(density));
    ipcMain.on(APIEvent.FilterAsc, (_e, asc: DisplayDirectionUpdate) => this.updateDisplayDirection(asc));
  }
}
