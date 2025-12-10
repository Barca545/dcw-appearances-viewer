import { Path } from "core/load";
import type { FilterDensity as DisplayDensity, DisplayOptions, FilterOrder as DisplayOrder } from "./apiTypes";

// TODO: Ideally this will eventually replace the apiTypes file

export interface Settings {
  theme: "system" | "light" | "dark";
  earthDropdownType: "user" | "external";
  width: string;
  height: string;
  fontSizeUseDefault: "true" | "false";
  fontSizeChoose: string;
  updateFrequency: "auto" | "prompt";
  // Also want to add default settings to this
}

/**Interface containing the data used to construct a list entry. The return result of window.api.form.submit */
export interface AppearanceData {
  title: string;
  synopsis: string;
  date: { year: number; month: number; day: number };
  link: string;
}

export type TabID = UUID;

/**The basic metadata all `Tab`s contain regardless of type. */
interface TabMetaData {
  ID: TabID;
  tabName: string;
}

export interface Tab {
  meta: TabMetaData;
  savePath: Option<Path>;
}

/**A Tab which holds data. */
export interface DataTab {
  isClean: boolean;
  data: any;

  serialize(): SerializedTab;
}

export interface TabStaticInterface {
  default(...args: any[]): Tab;
}

interface SerializedTab {
  /**Whether the search suceeded. */
  success: boolean;
  meta: TabMetaData;
}

/**A serialized snapshot of an app `Tab`'s state.*/
export interface SerializedAppTab extends SerializedTab {
  meta: { ID: TabID; tabName: string; characterName: string };
  options: DisplayOptions;
  appearances: AppearanceData[];
}

/**A serialized snapshot of a setting `Tab`'s state.*/
export interface SerializedSettingsTab extends SerializedTab {
  settings: Settings;
}

export type TabData = SerializedAppTab | SerializedSettingsTab;

/**Request from the renderer to the server to perform a search for a character's data on the wiki. */
export interface SearchRequest {
  /**ID of the tab making the request. Blank if the request is to open a new tab.*/
  id: TabID;
  /** The first and last name of the character. */
  character: string;
  /**The character's home universe. */
  universe: string;
}

export interface DisplayOrderUpdate {
  id: TabID;
  order: DisplayOrder;
}

export interface DisplayDensityUpdate {
  id: TabID;
  density: DisplayDensity;
}

export interface DisplayDirectionUpdate {
  id: TabID;
  dir: DisplayDensity;
}

export interface SettingsUpdate {
  id: TabId;
  settings: Settings;
}
