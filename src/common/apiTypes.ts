import { UUID } from "node:crypto";
import { None, Option, Some } from "../../core/option";

// TODO: I think some type files need to be reorganized.
// This has some types that should probably be exported from core.
// - FilterOptions
// - AppearanceData

export interface SearchRequest {
  /** The first and last name of the character. */
  character: string;
  /**The character's home universe */
  universe: string;
}

export enum FilterDensity {
  Dense = "DENSE",
  Normal = "NORM",
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

/**The response to a request to fetch appearences from the wiki. */
export interface SubmitResponse {
  success: boolean;
  character: string;
  appearances?: AppearanceData[];
}

export enum SortOrder {
  AlphaNumeric = "A-Z",
  PubDate = "PUB",
}

export namespace SortOrder {
  export function from(value: string): Option<SortOrder> {
    switch (value) {
      case "A-Z": {
        return new Some(SortOrder.AlphaNumeric);
      }
      case "PUB": {
        return new Some(SortOrder.PubDate);
      }
    }
    return new None();
  }
}

export class FilterOptions {
  order: SortOrder;
  density: FilterDensity;
  ascending: boolean;

  /**Create a new set of FilterOptions with the default parameters (density = "NORM", order = "PUB"). */
  constructor() {
    this.density = FilterDensity.Normal;
    this.order = SortOrder.PubDate;
    this.ascending = true;
  }

  setDensity(dense: FilterDensity) {
    this.density = dense;
    return this;
  }
  setOrder(ord: SortOrder) {
    this.order = ord;
    return this;
  }
  setAscending(asc: boolean) {
    this.ascending = asc;
    return this;
  }
}

// TODO: Possibly this should be in common
// This needs to mirror the API defined about is there a better way to do this consistently
declare global {
  interface Window {
    api: {
      settings: {
        request: () => Promise<Settings>;
        /**Save the new settings to the disk. */
        save: (data: Settings) => void;
        /**Send settings data to the main process without saving it to file. */
        apply: (data: Settings) => void;
        /**Close the window that send the request.*/
        close: () => void;
      };

      form: {
        /**Submits the form to the main process and returns the result to the renderer. */
        submit: (data: SearchRequest) => Promise<SubmitResponse>;
      };
      open: {
        /**Open a  new AppPage in the current tab. */
        page: (addr: AppPage) => void;
        /**Open a Web URL in the default browser. */
        url: (addr: string) => void;
        // TODO: Eventually should open in a new tab but that's beside the point
        /**Open a Project file in the current tab*/
        file: () => void;
      };
      // TODO: Do I need a request and send for this since saving needs to save the settings?
      requestReflow: (state: FilterOptions) => Promise<AppearanceData[]>;
      recieveData: (callback: (res: any) => any) => void;
      dataRequest: (data: any) => void;
      // TODO: Update the filter options held on main
      filter: {
        /**Set a new value for the App's filter order. */
        order: (order: SortOrder) => void;
        /**Set a new value for the App's filter density. */
        density: (density: FilterDensity) => void;
        /**Set a new value for the App's filter ascent direction. */
        ascending: (asc: boolean) => void;
      };
      // FIXME: I am not sure it should actually return void
      reflow: (r: (data: AppearanceData[], dense: FilterDensity) => void) => void;
    };
  }
}

/**Wrapper for sending messages through the Electron [IPC](https://www.electronjs.org/docs/latest/tutorial/ipc) to and from specific tabs.*/
export class APIMessage<T> {
  // TODO: Unclear how I'll actually get/make the tab IDs
  tabID: UUID;
  body: T;

  constructor(id: UUID, msg: T) {
    this.tabID = id;
    this.body = msg;
  }
}

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
