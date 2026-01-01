import type { DisplayDensity, DisplayDirection, DisplayOptions, DisplayOrder } from "../main/displayOptions";
import type { Settings } from "../main/settings";
import type { TabID, TabURL } from "./ipcAPI";
import type { TabMetaData } from "src/main/tab";

/**Interface containing the data used to construct a list entry. The return result of window.api.form.submit */
export interface SerializedListEntry {
  title: string;
  synopsis: string;
  date: { year: number; month: number; day: number };
  URL: string;
  link: string;
}

export interface SerializedTab {
  meta: TabMetaData;
}

export interface SerializedDataTab extends SerializedTab {
  meta: TabMetaData;
  isClean: boolean;
}

/**A serialized snapshot of an app `Tab`'s state.*/
export interface SerializedAppTab extends SerializedDataTab {
  meta: { ID: TabID; URL: TabURL; tabName: string; characterName: string };
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
export function isSerializedDataTab(tab: TabDataUpdate): tab is SerializedAppTab {
  return (tab as SerializedDataTab).isClean != undefined;
}

/**Request from the renderer to the server to perform a search for a character's data on the wiki. */
export interface SearchRequest {
  /**ID of the tab making the request.*/
  id: TabID;
  /** The first and last name of the character. */
  character: string;
  /**The character's home universe. */
  universe: string;
}

/**Message from the renderer to the main process containing an updated value for display order. */
export interface DisplayOrderUpdate {
  readonly ID: TabID;
  order: DisplayOrder;
}

/**Message from the renderer to the main process containing an updated value for display density. */
export interface DisplayDensityUpdate {
  readonly ID: TabID;
  density: DisplayDensity;
}

/**Message from the renderer to the main process containing an updated value for display direction. */
export interface DisplayDirectionUpdate {
  readonly ID: TabID;
  dir: DisplayDirection;
}

// TODO: Honestly, this could probably be used interchangeably with the serializedsettingstab
export interface SettingsTabUpdate {
  readonly ID: TabID;
  settings: Settings;
}
