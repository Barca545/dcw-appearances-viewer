import { Path } from "../../core/load";
import type { DisplayDensity, DisplayDirection, DisplayOptions, DisplayOrder } from "./apiTypes";
import { SerializedTabID, TabID } from "./ipcAPI";
import { Option } from "../../core/option";

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
export interface SerializedListEntry {
  title: string;
  synopsis: string;
  date: { year: number; month: number; day: number };
  link: string;
}

/**The basic metadata all `Tab`s contain regardless of type. */
interface TabMetaData {
  readonly ID: TabID;
  tabName: string;
}

interface SerializedTabMetaData {
  readonly ID: SerializedTabID;
  tabName: string;
}

export interface Tab {
  meta: TabMetaData;
  savePath: Option<Path>;

  /**Converts the tab into a serialized  */
  serialize(): SerializedTab;
}

/**A Tab which holds data. */
export interface DataTab {
  isClean: boolean;
  data: any;
}

export interface TabStaticInterface {
  default(...args: any[]): Tab;
}

export interface SerializedTab {
  meta: SerializedTabMetaData;
}

/**A serialized snapshot of an app `Tab`'s state.*/
export interface SerializedAppTab extends SerializedTab {
  meta: { ID: SerializedTabID; tabName: string; characterName: string };
  /**Whether the search suceeded. */
  success: boolean;
  opts: DisplayOptions;
  list: SerializedListEntry[];
}

/**A serialized snapshot of a setting `Tab`'s state.*/
export interface SerializedSettingsTab extends SerializedTab {
  settings: Settings;
}

export interface SerializedStartTab extends SerializedTab {}

export type TabDataUpdate = SerializedAppTab | SerializedSettingsTab | SerializedStartTab;

/**[Type guard](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards) to check whether a `TabDataUpdate` is a `SerializedAppTab`.*/
export function isSerializedAppTab(tab: TabDataUpdate): tab is SerializedAppTab {
  return (tab as SerializedAppTab).list != undefined;
}

/**Request from the renderer to the server to perform a search for a character's data on the wiki. */
export interface SearchRequest {
  /**ID of the tab making the request.*/
  id: SerializedTabID;
  /** The first and last name of the character. */
  character: string;
  /**The character's home universe. */
  universe: string;
}

/**Message from the renderer to the main process containing an updated value for display order. */
export interface DisplayOrderUpdate {
  readonly ID: SerializedTabID;
  order: DisplayOrder;
}

/**Message from the renderer to the main process containing an updated value for display density. */
export interface DisplayDensityUpdate {
  readonly ID: SerializedTabID;
  density: DisplayDensity;
}

/**Message from the renderer to the main process containing an updated value for display direction. */
export interface DisplayDirectionUpdate {
  readonly ID: SerializedTabID;
  dir: DisplayDirection;
}

export interface SettingsUpdate {
  readonly id: TabID;
  settings: Settings;
}
