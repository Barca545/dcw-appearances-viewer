import { UUID } from "node:crypto";
import { None, Option, Some } from "../../core/option";

// TODO: I think some type files need to be reorganized.
// This has some types that should probably be exported from core.
// - FilterOptions
// - AppearanceData

// FIXME: ONLY TEMP
export const TEMP_ID_WHILE_ONLY_ONE_TAB = `${"foo"}-${"bar"}-${"fizz"}-${"bazz"}-${"string"}`;

export interface SearchRequest {
  /** The first and last name of the character. */
  character: string;
  /**The character's home universe */
  universe: string;
  /**ID of the tab making the request. Blank if the request is to open a new tab.*/
  id?: UUID;
}

export enum FilterDensity {
  Normal = "NORM",
  Dense = "DENSE",
}

export namespace FilterDensity {
  export function from(value: string): Option<FilterDensity> {
    switch (value.toUpperCase()) {
      case "DENSE": {
        return new Some(FilterDensity.Dense);
      }
      case "NORM": {
        return new Some(FilterDensity.Normal);
      }
    }
    return new None();
  }
}

/**The response to a `requestUpdate` wrapped for transit through the Electron [IPC](https://www.electronjs.org/docs/latest/tutorial/ipc) to and from specific tabs.*/
export interface TabData {
  meta: { id: UUID; success: boolean; character: string };
  options: FilterOptions;
  appearances: AppearanceData[];
}

export enum FilterOrder {
  PubDate = "PUB",
  AlphaNumeric = "A-Z",
}

export namespace FilterOrder {
  export function from(value: string): Option<FilterOrder> {
    switch (value) {
      case "A-Z": {
        return new Some(FilterOrder.AlphaNumeric);
      }
      case "PUB": {
        return new Some(FilterOrder.PubDate);
      }
    }
    return new None();
  }
}

export interface FilterOptions {
  order: FilterOrder;
  density: FilterDensity;
  ascending: boolean;
}

export const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  order: FilterOrder.PubDate,
  density: FilterDensity.Normal,
  ascending: false,
};

// Keep this flat so it can be iterated over
export interface Settings {
  theme: "system" | "light" | "dark";
  earthDropdownType: "user" | "external";
  width: string;
  height: string;
  fontSizeUseDefault: "true" | "false";
  fontSizeChoose: string;
  updateFrequency: "auto" | "prompt";
}

/**Interface containing the data used to construct a list entry. The return result of window.api.form.submit */
export interface AppearanceData {
  title: string;
  synopsis: string;
  date: { year: number; month: number; day: number };
  link: string;
}

// TODO: List entry should be in shared?

export interface AppMessages {
  unsavedChanges: string;
  unimplemented: string;
  illegalFileType: string;
  DevContact: string;
}

export enum AppPage {
  Index = "index.html",
  StartPage = "start.html",
  Application = "app.html",
  Settings = "settings.html",
}

// Cursed way to kinda emulate rust enums
export namespace AppPage {
  export function from(value: string): Option<AppPage> {
    // It's like a shitty match statement :D (visually not under the hood)
    if (value.includes("start") || value.includes("start.html")) return new Some(AppPage.StartPage);
    else if (value.includes("app") || value.includes("app.html")) return new Some(AppPage.Application);
    else if (value.includes("settings") || value.includes("settings.html")) return new Some(AppPage.Settings);
    else return new None();
  }
}
