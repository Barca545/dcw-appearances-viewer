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
import type {
  SearchRequest,
  SerializedAppTab,
  SerializedSettingsTab,
  SettingsTabUpdate,
  TabDataUpdate,
} from "../common/TypesAPI";
import { openFileDialog } from "./menu";
import { createCharacterName } from "../common/utils";
import { fetchList } from "../../core/fetch";
import { IPCEvent, SerializedTabBarState, TabID } from "../../src/common/ipcAPI";
import { MENU_TEMPLATE } from "./menu";
import { AppTab, DataTab, isDataTab, SettingsTab, StartTab, Tab } from "./tab";

// FIXME: This not being a variable vite exposes is an issue with vite
const MAIN_WINDOW_PRELOAD_VITE_ENTRY = path.join(__dirname, `preload.js`);

declare const ERROR_WINDOW_VITE_DEV_SERVER_URL: string;

// TODO: This should probably go wherever controls the API serialization and stuff
interface APIEventMap {
  [IPCEvent.TabUpdate]: SerializedTabBarState;
  [IPCEvent.AppUpdate]: SerializedAppTab;
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

  /** - Set the `current` field to the specified TabID and update the `TabEventStack`
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
  }

  /**Place a tab in the tablist and set it as the current tab. */
  private openAndNavigateToTab(tab: Tab) {
    this.tabs.set(tab.meta.ID, tab);
    this.tabEventStack.push({ ID: tab.meta.ID, type: TabEventType.Open });
    this.currentTab = new Some(tab.meta.ID);
    this.tabEventStack.push({ ID: tab.meta.ID, type: TabEventType.Navigate });
  }

  /**Creates a new empty `AppTab`.
   * Insert the new tab into the `Session`'s tabs list.
   * Set the new tab as the current tab.
   */
  newAppTab() {
    // Try to save the current tab
    this.trySaveAppTabb();
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
    this.trySaveAppTabb();
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

  /**If the ID identifies a StartTab, open a new AppTab inside it.*/
  newAppTabInStartTab(ID: TabID) {
    let tab = this.getTab(ID);
    if (tab instanceof StartTab) {
      tab = AppTab.default({
        meta: {
          ID: TabID.create(),
          // This function will return a tab with the name "Untitled + <Number of Untitled Tabs>"
          tabName: `Untitled ${this.tabs.values().reduce((acc, tab) => {
            return tab.meta.tabName.includes("Untitled") ? acc + 1 : acc;
          }, 1)}`,
        },
        savePath: new None(),
      });
    }
  }

  /**If the ID identifies a StartTab, load saved ProjectData into it.*/
  openAppFileInStartTab(ID: TabID) {
    let tab = this.getTab(ID);
    if (tab instanceof StartTab) {
      const res = openFileDialog();

      // If the action was canceled, abort and return early
      if (res.isNone()) {
        return new None();
      }

      const data = AppTab.LoadProjectData(new Path(res.unwrap()));

      tab = AppTab.new({
        meta: {
          ID: TabID.create(),
          tabName: data.meta.title,
        },
        // We know it is valid by the time we reach here because we checked it with res.isNone() above
        savePath: new Some(new Path(res.unwrap())),
        projectData: data,
      });
    }
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
    this.sendIPC(IPCEvent.TabUpdate, this.serializeTabBarState());
  }

  // TODO: Instead of setting is clean directly, update everywhere it is used to this
  updateTabIsClean(ID: TabID, state: boolean) {
    let tab = this.getTab(ID) as unknown as DataTab;
    tab.isClean = state;
    this.sendIPC(IPCEvent.TabUpdate, this.serializeTabBarState());
  }

  /**Save a tab's `ProjectData` and mark the tab as clean. If no ID is provided, defaults to the current tab.*/
  saveAppTab(mustSaveAs: boolean, id?: TabID) {
    const tab = this.getTab(id ? id : this.currentTab.unwrap());
    if (tab instanceof AppTab) {
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

      tab.data.saveAsJSON(tab.savePath.unwrap());
      this.updateTabIsClean(tab.meta.ID, true);
    } else if (tab == undefined) {
      // TODO: This probalby needs to be stuck in messages although I am not sure when this case would happen
      // TODO: This probably also should be logged as an error
      alert(`Tab with ID ${this.currentTab} does not exist!`);
      return;
    }
  }

  /**Try to save a tab. Will fail if it does not have a save path. Defaults to saving the `currentTab`.*/
  trySaveAppTabb(id?: TabID) {
    const tab = this.getTab(id ? id : this.currentTab.unwrap());
    if (tab instanceof AppTab && tab.savePath.isSome()) {
      tab.data.saveAsJSON(tab.savePath.unwrap());
      this.updateTabIsClean(tab.meta.ID, true);
    }
  }

  /**Close all open tabs then close the window.*/
  close() {
    // Keys to remove
    // TODO: This feels dangerous since I am theoretically iterating over something while modifying it
    // In Rust, it would be easy to tell if this was illegal but TS does not care to tell
    for (const id of this.tabs.keys()) {
      let tab = this.getTab(id) as Tab;

      // TODO: A better way to do this is to cycle and grab all the ids that should should close
      // Then the closeTab doesn't need to return a boolean

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

  /**Attempt to close an AppTab.
   * Removes the tab from the `Session` and Renderer's tab lists.
   * Prompt the user for how to handle an unsaved tab.
   * @returns `true` if the tab closed.
   * @returns `false` if the process was aborted. */
  closeTab(ID: TabID): boolean {
    const tab = this.getTab(ID);
    if (tab && tab instanceof AppTab) {
      if (tab.isClean) {
        this.perfromTabClose(ID);
        return true;
      }
      const res = this.promptUsavedClose();

      if (res === CloseType.Cancel) {
        return false;
      } else if (res === CloseType.Save) {
        this.saveAppTab(false, ID);
        this.perfromTabClose(ID);
        return true;
      } else {
        // This is don't save
        this.perfromTabClose(ID);
        return true;
      }
    }

    return true;
  }

  /**Update the character of a tab.
   * Errors if the tab does not exist or is not an AppTab.
   * Returns the tab's serialized data.
   * */
  updateTabCharacter(req: SearchRequest): SerializedAppTab {
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

    fetchList(tab.meta.characterName).then((res) => (tab.data.list = res.unwrap_or([])));

    this.updateTabIsClean(tab.meta.ID, false);

    // Return the tab
    return tab.serialize();
  }

  /**Update the current `AppTab`'s `DisplayOptions`.*/
  updateDisplayOptions(update: DisplayOptions) {
    let tab = this.getTab(this.currentTab.unwrap()) as AppTab;

    tab.updateDisplayOptions(update);

    console.log(tab.serialize());

    this.sendIPC(IPCEvent.AppUpdate, tab.serialize());
  }

  /**Set or reset the session's autosave timer */
  setAutoSave(len: string) {
    // Clear any preexisting timer
    if (this.autosave) {
      this.autosave.close();
    }
    // Set the timer
    this.autosave = setInterval(() => this.tabs.keys().forEach((id) => this.trySaveAppTabb(id)), Number.parseInt(len));
  }

  /**Restart the autosave timer. */
  resetAutoSave() {
    if (this.autosave) this.autosave.refresh();
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

  /**Save the new state to the Settings file.*/
  saveSettings(state: Settings) {
    // Update the data so all settings tabs are in sync
    this.tabs.forEach((tab) => {
      if (tab instanceof SettingsTab) tab.data = state;
    });
    this.applySettings(state);
    // Actually save the settings
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(state), { encoding: "utf-8" });
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

  resetSettings() {
    const defaults = JSON.parse(fs.readFileSync(path.join(RESOURCE_PATH, "settings.json"), { encoding: "utf-8" })) as Settings;
    // Update the data for each settings tab
    // TODO: It occurs to me settings tabs don't need to store the data and can just load it ad hoc then send it
    this.tabs.forEach((tab) => {
      if (tab instanceof SettingsTab) tab.data = defaults;
    });

    this.settings = defaults;
    this.saveSettings(defaults);
    this.applySettings(defaults);
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
    state.list.forEach(({ meta }) => newTabs.set(meta.ID, this.getTab(meta.ID) as Tab));
    this.tabs = newTabs;

    return this.serializeTabBarState();
  }

  serializeTabBarState(): SerializedTabBarState {
    const selectedTab = this.getTab(this.currentTab.unwrap()) as Tab;
    return {
      selected: selectedTab.meta,
      list: [...this.tabs.values()].map((tab) => ({
        TabType: tab.type(),
        meta: tab.meta,
        isClean: isDataTab(tab) ? tab.isClean : true,
      })),
    };
  }

  /** Serializes the `Session` tabs' `TabMetaData` and sends it to the main process.*/
  updateTabBar() {
    this.sendIPC(IPCEvent.TabUpdate, this.serializeTabBarState());
  }

  isReadyToClose(): boolean {
    for (const tab of this.tabs) {
      if (tab instanceof AppTab || (tab instanceof SettingsTab && !tab.isClean)) {
        return false;
      }
    }
    return true;
  }

  // TODO: Event handlers, I hate these names

  handleAppTabDataRequest(ID: TabID): SerializedAppTab {
    const tab = this.getTab(ID);
    if (tab == undefined) {
      throw new Error(`Tab ${ID} does not exist.`);
    } else if (!(tab instanceof AppTab)) {
      throw new Error(`Tab ${ID} aka ${tab.meta.tabName} is not an application tab.`);
    } else {
      return tab.serialize();
    }
  }

  /**Register `IPC` event handlers for communication between the renderer and main process*/
  async initListeners() {
    // FOR SPACE, THESE MAY USE THE COMMA OPERATOR

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
    ipcMain.on("window-all-closed", () => !IS_MAC && app.quit());

    this.win.on("close", (e) => {
      if (this.tabs.size > 0 || !this.isReadyToClose()) {
        e.preventDefault();
        this.close();
      }
    });

    this.win.on("blur", () => this.trySaveAppTabb());

    // TAB BAR LISTENERS
    ipcMain.handle(IPCEvent.TabRequest, () => this.serializeTabBarState());
    ipcMain.handle(IPCEvent.TabGo, (_e, ID: TabID) => (this.navigateToTab(ID), this.serializeTabBarState()));
    ipcMain.handle(IPCEvent.TabOpen, () => (this.newAppTab(), this.serializeTabBarState()));
    ipcMain.handle(IPCEvent.TabReorder, (_e, state: SerializedTabBarState) => this.setTabBarState(state));
    ipcMain.handle(IPCEvent.TabClose, (_e, ID) => (this.closeTab(ID), this.serializeTabBarState()));

    // APPLICATION TAB LISTENERS
    ipcMain.handle(IPCEvent.AppRequest, (_e, ID: TabID) => this.handleAppTabDataRequest(ID));
    ipcMain.handle(IPCEvent.AppSearch, (_e, req: SearchRequest) => this.updateTabCharacter(req));

    // SETTINGS TAB LISTENERS
    ipcMain.handle(IPCEvent.SettingsRequest, () => this.settings);
    ipcMain.handle(IPCEvent.SettingsSave, (_e, state: SettingsTabUpdate) => (this.saveSettings(state.settings), this.settings));
    ipcMain.handle(IPCEvent.SettingsReset, () => (this.resetSettings(), this.settings));

    // START TAB LISTENERS
    // FIXME: I am pretty sure this is actually a start tab function
    ipcMain.on(IPCEvent.StartOpenNew, (_e, ID: TabID) => {
      this.newAppTabInStartTab(ID);
      this.sendIPC(IPCEvent.TabUpdate, this.serializeTabBarState());
    });
    ipcMain.on(IPCEvent.StartOpenFile, (_e, ID: TabID) => {
      this.openAppFileInStartTab(ID);
      this.sendIPC(IPCEvent.TabUpdate, this.serializeTabBarState());
    });

    // NAVIGATION LISTENERS
    ipcMain.on(IPCEvent.OpenURL, (_e, url: string) => shell.openExternal(url));

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
