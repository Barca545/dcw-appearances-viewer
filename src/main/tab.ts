import { Path } from "../../core/load";
import { ProjectData } from "./projectData";
import { TabID, TabURL } from "../../src/common/ipcAPI";
import { None, Option, Some } from "../../core/option";
import { SerializedAppTab, SerializedSettingsTab, SerializedStartTab, SerializedTab } from "../../src/common/TypesAPI";
import { Settings } from "./settings";
import { DisplayOptions, DisplayOrder } from "./displayOptions";
import { pubDateSort } from "../../core/pub-sort";
import { dialog } from "electron";
import { __userdata, IS_DEV, MESSAGES, RESOURCE_PATH, SETTINGS_PATH } from "./utils";
import path from "path";
import fs from "fs";

// TODO: I think it is fine for tab go

// TODO: This definitely belongs somewhere else in a utils file in common
function staticImplements<T>() {
  return <U extends T>(constructor: U) => {
    constructor;
  };
}

@staticImplements<TabStaticInterface>()
export class SettingsTab implements DataTab {
  meta: { ID: TabID; tabName: "Settings"; URL: `/settings/${TabID}` };
  // FIXME: Since the session also stores settings, I don't like having settings in two places
  // TODO: Needs to store old settings so saving without saving reapplies old settings
  data: Settings;
  isClean: boolean;
  savePath: Option<Path>;

  private constructor() {
    const ID = TabID.create();
    this.meta = { ID, tabName: "Settings", URL: `/settings/${ID}` };
    this.data = SettingsTab.getSettings();
    this.isClean = true;
    this.savePath = new Some(new Path(SETTINGS_PATH));
  }

  serialize(): SerializedSettingsTab {
    return {
      meta: this.meta,
      settings: this.data,
    };
  }

  type(): "SETTINGS" {
    return "SETTINGS";
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
  meta: { ID: TabID; tabName: "Start"; URL: `/start/${TabID}` };
  savePath: None<Path>;

  constructor(ID: TabID) {
    this.meta = { ID, tabName: "Start", URL: `/start/${ID}` };
    this.savePath = new None();
  }

  /**Create a settings page with `TabType==Settings`.*/
  static default(): StartTab {
    return new StartTab(TabID.create());
  }

  serialize(): SerializedStartTab {
    return {
      meta: this.meta,
    };
  }

  type(): "START" {
    return "START";
  }
}

@staticImplements<TabStaticInterface>()
/**Main process-side representation.
 * @field meta: Metadata identifying the tab and its contents.
 * @field isClean: Field indicating whether the `SessionTab` has unsaved changes.
 */
export class AppTab implements DataTab {
  // TODO: maybe "meta" should be made an interface since I reuse it like 3 places
  meta: { ID: TabID; URL: `/app/${TabID}`; tabName: string; characterName: string };
  savePath: Option<Path>;
  /**Indicates whether the tab has unsaved changes. */
  isClean: boolean;
  data: ProjectData;

  private constructor(args: { meta: { ID: TabID; tabName: string }; savePath: Option<Path>; projectData: ProjectData }) {
    this.meta = { ID: args.meta.ID, URL: `/app/${args.meta.ID}`, tabName: args.meta.tabName, characterName: "" };
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

  /**Serializes the information in the tab as `TabData`. */
  serialize(): SerializedAppTab {
    return {
      isClean: this.isClean,
      // TODO: This is kinda lazy but it's a quick and dirty check
      // TODO: I need to add a real check for a failed search
      success: this.data.list.length != 0,
      meta: { ...this.meta, ID: this.meta.ID },
      list: this.data.list.map((entry) => entry.toAppearanceData()),
      opts: this.data.meta.opts,
    };
  }

  type(): "APP" {
    return "APP";
  }

  /**Load `ProjectData` from a file. Reflowing is unnecessary as it is assumed the file was reflowed according to its saved `FilterOptions`.*/
  static LoadProjectData(savePath: Path): ProjectData {
    try {
      switch (savePath.ext) {
        case ".xml": {
          return AppTab._reflow(ProjectData.fromXML(savePath));
        }
        case ".json": {
          return AppTab._reflow(ProjectData.fromJSON(savePath));
        }
        default: {
          dialog.showErrorBox("Load Failed", MESSAGES.illegalFileType);
          return ProjectData.default();
        }
      }
    } catch (err) {
      dialog.showErrorBox("Load Failed", (err as Error).message);
      return ProjectData.default();
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
    if (!data.meta.opts.dir) {
      data.list.reverse();
    }

    return data;
  }

  /**Update the tab's `ProjectData`'s display options and reflow the list. */
  updateDisplayOptions(update: DisplayOptions) {
    this.data.meta.opts = update;
    this.reflow();
  }
}

/**The basic metadata all `Tab`s contain regardless of type. */
export interface TabMetaData {
  readonly ID: TabID;
  readonly URL: TabURL;
  tabName: string;
}

export interface Tab {
  meta: TabMetaData;
  savePath: Option<Path>;

  /**serializes the `Tab`'s data.*/
  serialize(): SerializedTab;

  /**Returns the type of the `Tab`. */
  type(): "APP" | "START" | "SETTINGS";
}

/**A Tab which holds data. */
export interface DataTab extends Tab {
  isClean: boolean;
  data: any;
}

export interface TabStaticInterface {
  default(...args: any[]): Tab;
}

export function isDataTab(tab: Tab): tab is DataTab {
  return (tab as DataTab).isClean != undefined;
}
