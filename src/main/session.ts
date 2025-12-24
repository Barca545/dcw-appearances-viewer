import { Path } from "../../core/load";
import { None, Option, Some } from "../../core/option";
import Electron, { app, BrowserWindow, dialog, ipcMain, Menu, shell } from "electron";
import path from "node:path";
import { DisplayOptions, Settings } from "../common/apiTypes";
import {
  RESOURCE_PATH,
  SETTINGS_PATH,
  IS_DEV,
  __userdata,
  MESSAGES,
  IS_MAC,
  ROOT_DIRECTORY,
  UNIMPLEMENTED_FEATURE,
} from "./main_utils";
import fs from "node:fs";
import type { DataTab, SearchRequest, SerializedSettingsTab, SettingsTabUpdate, Tab, TabDataUpdate } from "../common/TypesAPI";
import { openFileDialog } from "./menu";
import { createCharacterName } from "../common/utils";
import { fetchList } from "../../core/fetch";
import { APIEvent, SerializedTabBarState, TabID } from "../../src/common/ipcAPI";
import { MENU_TEMPLATE } from "./menu";
import { AppTab, isDataTab, SettingsTab, StartTab } from "./tab";

// FIXME: This not being a variable vite exposes is an issue with vite
const MAIN_WINDOW_PRELOAD_VITE_ENTRY = path.join(__dirname, `preload.js`);

declare const ERROR_WINDOW_VITE_DEV_SERVER_URL: string;

// TODO: This should probably go wherever controls the API serialization and stuff
interface APIEventMap {
  [APIEvent.TabUpdate]: TabDataUpdate;
  [APIEvent.SettingsRequest]: Settings;
  [APIEvent.TabGo]: TabID;
  [APIEvent.TabBarClose]: TabID;
  [APIEvent.TabBarUpdate]: SerializedTabBarState;
  [APIEvent.SettingsUpdate]: SerializedSettingsTab;
}

export class Session {
  win: BrowserWindow;
  settings: Settings;
  tabs: Map<TabID, Tab>;
  tabEventStack: TabEvent[];
  currentTab: Option<TabID>;
  // TODO: This needs to refresh whenever a save happens
  // TODO: This should probably also be per tab but I am lazy
  // TODO: One way to do this might be a map of IDs and timers for each tab or including it in the original Map. I don't want to make it part of the session classes themselves but otoh...
  /**The timeout which controls the autosave process. */
  autosave?: NodeJS.Timeout;

  constructor() {
    const settings = Session.getSettings();
    this.settings = settings;
    this.tabs = new Map();
    this.tabEventStack = [];
    this.win = Session.createWindow(settings);
    this.currentTab = new None();

    // Load Contents
    // The Renderer is basically running an SPA so we only need to load the index
    if (IS_DEV) {
      // This is a literal because it is not a string but a url
      this.win.loadURL(`${ROOT_DIRECTORY}/src/renderer/index.html`);
    } else {
      this.win.loadFile(path.join(ROOT_DIRECTORY, "..", "renderer", MAIN_WINDOW_VITE_NAME, "src", "renderer", `index.html`));
    }

    this.win.setMenu(Menu.buildFromTemplate(MENU_TEMPLATE(this)));

    // In development if this is "on" and not "once" each save will create a new tab
    this.win.webContents.once("did-finish-load", () => {
      // Because this assigns the current tab internally it means the current tab is definitely initialized
      this.newStartTab();
    });

    // Set settings
    this.applySettings(this.settings);
  }

  /**Waits until webContents are loaded. */
  private static createWindow(settings: Settings): BrowserWindow {
    let win = new BrowserWindow({
      width: Number.parseInt(settings.width),
      height: Number.parseInt(settings.height),
      webPreferences: {
        contextIsolation: true,
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

  newErrorWin() {
    const parentBounds = this.win.getBounds();

    let err_win = new BrowserWindow({
      width: Number.parseInt(this.settings.width),
      height: Number.parseInt(this.settings.height),
      parent: this.win,
      x: parentBounds.x + 50,
      y: parentBounds.y + 50,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: MAIN_WINDOW_PRELOAD_VITE_ENTRY,
      },
    });

    err_win.webContents.on("did-finish-load", () => {
      if (!err_win) throw new Error('"win" is not defined');
      err_win.show();
      err_win.focus();
    });

    // FIXME: This needs to become a path.join in the Session constrctor too. Also confirm root dir isn't just dirname
    if (IS_DEV) {
      err_win.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/src/renderer/error.html`);
      err_win.setMenu(
        Menu.buildFromTemplate([
          {
            label: "View",
            submenu: [{ role: "toggleDevTools" }],
          },
        ]),
      );
    } else {
      err_win.loadFile(path.join(ROOT_DIRECTORY, "..", "renderer", MAIN_WINDOW_VITE_NAME, "src", "renderer", "error.html"));
      err_win.setMenu(null);
    }
  }

  /** - Set the `current` field to the specified TabID.
   * - Update the `TabEventStack`
   * - Send `APIEvent.TabBarUpdate` and `APIEvent.TabGo`
   */
  private navigateToTab(ID: TabID) {
    // Don't navigate to the current tab
    if (this.currentTab.unwrap() == ID) {
      return;
    }

    if (IS_DEV) {
      if (!this.tabs.has(ID)) {
        throw new Error(`ID ${ID} does not exist. Cannot Navigate. Valid IDs are:${[...this.tabs.keys()]}`);
      }
    }

    this.currentTab = new Some(ID);
    this.tabEventStack.push({ ID: ID, type: TabEventType.Navigate });
    // TODO: A little inefficient
    this.sendIPC(APIEvent.TabBarUpdate, this.serializeTabBarState());
    this.sendIPC(APIEvent.TabGo, this.currentTab.unwrap());
  }

  private openAndNavigateToTab(tab: Tab) {
    this.tabs.set(tab.meta.ID, tab);
    this.tabEventStack.push({ ID: tab.meta.ID, type: TabEventType.Open });
    this.currentTab = new Some(tab.meta.ID);
    this.tabEventStack.push({ ID: tab.meta.ID, type: TabEventType.Navigate });
    this.sendIPC(APIEvent.TabUpdate, tab.serialize());
    this.sendIPC(APIEvent.TabBarUpdate, this.serializeTabBarState());
    this.sendIPC(APIEvent.TabGo, tab.meta.ID);
  }

  /**Creates a new empty `AppTab`.
   * Insert the new tab into the `Session`'s tabs list.
   * Send the data to the renderer.
   */
  newAppTab() {
    // Try to save the current tab
    this.trysave();
    const tab = AppTab.default({
      meta: {
        ID: TabID.create(),
        // This function will return a tab with the name "Untitled + <Number of Untitled Tabs>"
        tabName: `Untitled ${this.tabs.values().reduce((acc, tab) => {
          return tab.meta.tabName.includes("Untitled") ? acc + 1 : acc;
        }, 1)}`,
      },
      savePath: new None(),
    });

    this.openAndNavigateToTab(tab);
  }

  /** Create a new `Tab` from a file's `ProjectData`.
   * Insert the new tab into the `Session`'s tabs list.
   * Send the data to the renderer.
   */
  newAppTabFromFile() {
    // Try to save the current tab
    this.trysave();
    const res = openFileDialog();

    // If the action was canceled, abort and return early
    if (res.isNone()) {
      return new None();
    }

    const data = AppTab.LoadProjectData(new Path(res.unwrap()));

    const tab = AppTab.new({
      meta: {
        ID: TabID.create(),
        tabName: data.meta.title,
      },
      // We know it is valid by the time we reach here because we checked it with res.isNone() above
      savePath: new Some(new Path(res.unwrap())),
      projectData: data,
    });

    this.openAndNavigateToTab(tab);
  }

  /**Create a new Start Tab.
   * Insert the new tab into the `Session`'s tabs list.
   * Send the data to the renderer.
   */
  newStartTab() {
    this.openAndNavigateToTab(StartTab.default());
  }

  /**Create a new Settings Tab.
   * Insert the new tab into the `Session`'s tabs list.
   * Send the data to the renderer.
   */
  newSettingsTab() {
    this.openAndNavigateToTab(SettingsTab.default());
  }

  // TODO: Instead of setting is clean directly, update everywhere it is used to this
  updateTabIsClean(ID: TabID, state: boolean) {
    let tab = this.tabs.get(ID) as unknown as DataTab;
    tab.isClean = state;
    this.sendIPC(APIEvent.TabBarUpdate, this.serializeTabBarState());
  }

  /**Save a tab's `ProjectData` and mark the tab as clean. If no ID is provided, defaults to the current tab.*/
  saveFile(mustSaveAs: boolean, id?: TabID) {
    // Confirm tab is not a start tab
    const tab = this.getTab(id ? id : this.currentTab.unwrap());
    if (tab instanceof StartTab) {
      return;
    } else if (!tab) {
      // TODO: This probalby needs to be stuck in messages although I am not sure when this case would happen
      // TODO: This probably also should be logged as an error
      alert(`Tab with ID ${this.currentTab} does not exist!`);
      return;
    }

    // If there is no save_path or if this is explicitly a save as command update the save path.
    if (mustSaveAs || tab.savePath.isNone()) {
      const res = dialog.showSaveDialogSync(this.win, {
        defaultPath: app.getPath("documents"),
        // FIXME: Can't be this and openFile figure out the difference
        properties: ["createDirectory", "showOverwriteConfirmation"],
        filters: [
          // I don't really think there is a reason to add txt saving since JSONs are plaintext but maybe
          { name: ".json", extensions: ["json"] },
        ],
      });

      // Early return if the user cancels
      if (!res) return;

      // Update the save path
      tab.savePath = new Some(new Path(res));
    }

    if (tab instanceof AppTab) {
      tab.data.saveAsJSON(tab.savePath.unwrap());
      this.updateTabIsClean(tab.meta.ID, true);
    } else if (tab instanceof SettingsTab) {
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(tab.data), { encoding: "utf-8" });
    }
  }

  /**Try to save a tab. Will fail if it does not have a save path. Defaults to saving the `currentTab`.*/
  trysave(id?: TabID) {
    const tab = this.getTab(id ? id : this.currentTab.unwrap());
    if (tab instanceof StartTab || tab instanceof SettingsTab) {
      return;
    } else if (tab instanceof AppTab && tab.savePath.isSome()) {
      tab.data.saveAsJSON(tab.savePath.unwrap());
      this.updateTabIsClean(tab.meta.ID, true);
    }
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

  /**Close all open tabs then close the window.*/
  close() {
    // Keys to remove
    // TODO: This feels dangerous since I am theoretically iterating over something while modifying it
    // In Rust, it would be easy to tell if this was illegal but TS does not care to tell
    for (const id of this.tabs.keys()) {
      let tab = this.getTab(id) as Tab;

      // If the user cancels closing a tab abort the close process
      if (!this.closeTab(tab.meta.ID)) {
        return;
      }
    }

    this.win.close();
  }

  promptUsavedClose(): CloseType {
    const res = dialog.showMessageBoxSync(this.win, {
      title: "Unsaved Changes",
      message: MESSAGES.unsavedChanges,
      type: "question",
      buttons: ["Save", "Don't Save", "Cancel"],
      noLink: true,
    });

    return res === 0 ? CloseType.Save : res === 1 ? CloseType.DontSave : CloseType.Cancel;
  }

  // TODO: This needs testing
  perfromTabClose(ID: TabID) {
    // If it is a start tab or is not dirty close the tab
    this.tabs.delete(ID);
    // If there are no more tabs open, close the actual application
    if (this.tabs.size == 0) this.win.close();

    this.navigateToNextAvailableTab();

    this.tabEventStack.push({ ID: ID, type: TabEventType.Close });
  }

  // TODO: This needs testing
  navigateToNextAvailableTab() {
    // Find most recent valid tab from navigation history
    // TODO: A better way of doing this might be to create a pseudo linked list it can follow backwards through the events
    const target = this.tabEventStack
      .toReversed()
      .filter((event) => event.type == TabEventType.Navigate)
      .find((event) => this.tabs.has(event.ID));

    if (target) {
      this.navigateToTab(target.ID);
    } else {
      // Fallback: Navigate to first available tab
      const firstTabID = this.tabs.keys().next().value as TabID;
      this.navigateToTab(firstTabID);
    }
  }

  /**Attempt to close a tab.
   * Removes the tab from the `Session` and Renderer's tab lists.
   * Prompt the user for how to handle an unsaved tab.
   * @returns `true` if the tab closed.
   * @returns `false` if the process was aborted. */
  closeTab(ID: TabID): boolean {
    const tab = this.getTab(ID);
    if (tab instanceof StartTab) {
      this.tabs.delete(ID);
    } else if ((tab instanceof AppTab || tab instanceof SettingsTab) && !tab.isClean) {
      const res = this.promptUsavedClose();

      if (res === CloseType.Cancel) {
        return false;
      } else if (res === CloseType.Save) {
        this.saveFile(false, ID);
        this.closeTab(ID);
      }
    }

    this.perfromTabClose(ID);

    return true;
  }

  /**Update the character of a tab.
   * Errors if the tab does not exist or is not an AppTab.
   * Sends the new data back to the tab.*/
  async updateTabCharacter(req: SearchRequest) {
    const tab = this.getTab(req.id);
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
    this.updateTabIsClean(tab.meta.ID, false);

    // Send the tab back
    this.sendIPC(APIEvent.TabUpdate, tab.serialize());
  }

  /**Update the current `AppTab`'s `DisplayOptions`.*/
  updateDisplayOptions(update: DisplayOptions) {
    let tab = this.getTab(this.currentTab.unwrap()) as AppTab;

    tab.updateDisplayOptions(update);

    console.log(tab.serialize());

    this.sendIPC(APIEvent.TabUpdate, tab.serialize());
  }

  /**Set or reset the session's autosave timer */
  setAutoSave(len: string) {
    // Clear any preexisting timer
    if (this.autosave) {
      this.autosave.close();
    }
    // Set the timer
    this.autosave = setInterval(() => this.tabs.keys().forEach((id) => this.trysave(id)), Number.parseInt(len));
  }

  /**Restart the autosave timer. */
  resetAutoSave() {
    if (this.autosave) this.autosave.refresh();
  }

  /**Update the current session's settings without saving them to userdata.
   *
   * Send the changes to the renderer.*/
  saveSettingsFromRenderer(update: SettingsTabUpdate) {
    const tab = this.getTab(update.ID) as SettingsTab;
    // Update the current tab
    tab.data = update.settings;
    this.updateTabIsClean(tab.meta.ID, false);
    this.applySettings(update.settings);
    // Send back to the renderer, inefficient but preserves state
    this.sendIPC(APIEvent.SettingsUpdate, tab.serialize());
  }

  applySettings(settings: Settings) {
    // Update the actual session settings data
    this.settings = settings;
    // Apply the theme settings
    Electron.nativeTheme.themeSource = settings.theme;
    // TODO: apply window size changes
    this.win.setSize(Number.parseInt(settings.width), Number.parseInt(settings.height));
    // TODO: Apply fontsize
    this.win.webContents.executeJavaScript(
      `document.documentElement.style.setProperty("--base-font-size","${settings.fontSize}px");`,
    );
    // TODO: Apply update frequency
    // TODO: Apply autosave frequency if there is a difference between the two
    this.setAutoSave(settings.saveSettings.autosaveFrequency);
  }

  resetSettings(ID: TabID) {
    const settings = JSON.parse(fs.readFileSync(path.join(RESOURCE_PATH, "settings.json"), { encoding: "utf-8" })) as Settings;
    let tab = this.tabs.get(ID) as SettingsTab;
    tab.data = settings;
    this.updateTabIsClean(tab.meta.ID, false);
    this.settings = settings;
    this.saveFile(false, ID);
    this.applySettings(settings);
    this.sendIPC(APIEvent.SettingsUpdate, tab.serialize());
  }

  sendIPC<K extends keyof APIEventMap>(type: K, payload: APIEventMap[K]) {
    this.win.webContents.send(type, payload);
  }

  getTab(ID: TabID): Tab | undefined {
    return this.tabs.get(ID);
  }

  /**Reorders the Session's `Tab`'s in place to match the requested order. Returns the new state. */
  // FIXME: This should be called whenever the tabs change
  setTabBarState(state: SerializedTabBarState): SerializedTabBarState {
    let newTabs: Map<TabID, Tab> = new Map();
    state.list.forEach(({ meta }) => newTabs.set(meta.ID, this.tabs.get(meta.ID) as Tab));
    this.tabs = newTabs;

    return this.serializeTabBarState();
  }

  serializeTabBarState(): SerializedTabBarState {
    return {
      selected: this.currentTab.unwrap(),
      list: [...this.tabs.values()].map((tab) => ({
        TabType: tab.type(),
        meta: tab.meta,
        isClean: isDataTab(tab) ? tab.isClean : true,
      })),
    };
  }

  /** Serializes the `Session` tabs' `TabMetaData` and sends it to the main process.*/
  updateTabBar() {
    this.sendIPC(APIEvent.TabBarUpdate, this.serializeTabBarState());
  }

  isReadyToClose(): boolean {
    for (const tab of this.tabs) {
      if (tab instanceof AppTab || (tab instanceof SettingsTab && !tab.isClean)) {
        return false;
      }
    }
    return true;
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
      if (this.tabs.size > 0 || !this.isReadyToClose()) {
        e.preventDefault();
        this.close();
      }
    });
    // TODO: I do want to try and save stuff on blur or on changing tabs
    // but I don't want to to be hit with a savea
    this.win.on("blur", () => this.trysave());

    // TABBAR LISTENERS
    // TODO: See ipcAPI documentation for what these are supposed to do
    ipcMain.handle(APIEvent.TabBarRequestState, () => this.serializeTabBarState());
    ipcMain.handle(APIEvent.TabBarOpenAndUpdateCurrent);
    ipcMain.handle(APIEvent.TabBarUpdate);
    ipcMain.handle(APIEvent.TabBarClose);
    ipcMain.handle(APIEvent.TabBarReorder);

    // NAVIGATION LISTENERS
    // ipcMain.on(APIEvent.OpenTab, () => this.newAppTab());
    ipcMain.handle(APIEvent.OpenFile, () => this.newAppTabFromFile());
    ipcMain.on(APIEvent.OpenURL, (_e, url: string) => shell.openExternal(url));

    // SEARCHING FOR CHARACTERS AND REFLOW LISTENERS
    ipcMain.handle(APIEvent.TabRequestState, () => this.tabs.get(this.currentTab.unwrap())?.serialize());
    ipcMain.on(APIEvent.TabUpdateCurrent, (_e, ID) => this.navigateToTab(ID));
    ipcMain.on(APIEvent.TabSearch, (_e, req: SearchRequest) => this.updateTabCharacter(req));
    ipcMain.on(APIEvent.TabBarClose, (_e, id: TabID) => this.closeTab(id));

    // SETTINGS LISTENERS
    ipcMain.handle(APIEvent.SettingsRequest, () => this.settings);
    ipcMain.on(APIEvent.SettingsSave, (_e, settings: SettingsTabUpdate) => {
      this.saveSettingsFromRenderer(settings);
      this.saveFile(false);
    });
    ipcMain.on(APIEvent.SettingsReset, (_e, ID) => this.resetSettings(ID));

    // DISPLAY STYLE LISTENERS
    ipcMain.on(APIEvent.DisplayOptionsRequestUpdate, (_e, opts: DisplayOptions) => this.updateDisplayOptions(opts));

    // Error Listeners
    // TODO: I think this needs to get fed to the logger
    ipcMain.on("error:submit", () => UNIMPLEMENTED_FEATURE());
  }
}

// Eventually can store the closed tabs in a temporary storage on disk to facilitate reopening
interface TabEvent {
  ID: TabID;
  type: TabEventType;
}

enum TabEventType {
  Open = "Open",
  Close = "Close",
  Navigate = "Navigate",
}

enum CloseType {
  Save,
  DontSave,
  Cancel,
}
