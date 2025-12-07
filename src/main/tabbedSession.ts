import { ProjectData } from "core/load";
import { None, Option } from "core/option";
import { UUID } from "crypto";
import { BrowserWindow } from "electron";
import path from "path";
import { Path } from "react-router";
import { DEFAULT_FILTER_OPTIONS, FilterOptions } from "src/common/apiTypes";
import { MAIN_WINDOW_PRELOAD_VITE_ENTRY } from "./devTypes";
import { RESOURCE_PATH, IS_DEV, __userdata } from "./main_utils";
import fs from "node:fs";
import { Settings } from "src/common/TypesAPI";

export class Session {
  win: BrowserWindow;
  settings: Settings;
  tabs: SessionTab[];

  constructor() {
    const settings = Session.getSettings();
    this.win = Session.makeWindow(settings);
    this.settings = settings;
    // TODO: I think this needs to start prefilled with the "start page"
    this.tabs = [];
  }

  newtab() {
    this.tabs.push(
      new SessionTab({
        meta: {
          ID: crypto.randomUUID(),
          // This function will return a tab with the name "Untitled + <Number of Untitled Tabs>"
          name: `Untitled ${this.tabs.reduce((acc, tab) => {
            return tab.meta.name.includes("Untitled") ? acc + 1 : acc;
          }, 0)}`,
        },
        savePath: new None(),
        isClean: true,
        projectData: ProjectData.empty(),
        opt: DEFAULT_FILTER_OPTIONS,
      }),
    );
  }

  newTabFromFile() {}

  private static makeWindow(settings: Settings): BrowserWindow {
    let win = new BrowserWindow({
      width: Number.parseInt(settings.width),
      height: Number.parseInt(settings.height),
      // FIXME: I don't want any title on the window the tabs will have titles
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
}

/**Main process-side representation*/
class SessionTab {
  // TODO: maybe "meta" should be made an interface since I reuse it like 3 places
  meta: { ID: UUID; name: string };
  savePath: Option<Path>;
  /**Field indicating whether the `SessionTab` has unsaved changes.*/
  isClean: boolean;
  projectData: ProjectData;
  opt: FilterOptions;

  constructor(arg: {
    meta: { ID: UUID; name: string };
    savePath: Option<Path>;
    /**Field indicating whether the `SessionTab` has unsaved changes.*/
    isClean: boolean;
    projectData: ProjectData;
    opt: FilterOptions;
  }) {
    this.meta = arg.meta;
    this.isClean = arg.isClean;
    this.savePath = arg.savePath;
    this.projectData = ProjectData.empty();
    this.opt = DEFAULT_FILTER_OPTIONS;
  }
}
