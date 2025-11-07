import { None, Option, Some } from "../../core/option";

// TODO: I think some type files need to be reorganized.
// This has some types that should probably be exported from core.
// - FilterOptions
// - AppearanceData

export interface SearchRequest {
  "character-selection": string;
  "universe-select": string;
}

export class FilterOptions {
  sortOrder: "PUB" | "A-Z";
  density: "NORM" | "DENSE";
  ascending: boolean;

  /**Create a new set of FilterOptions with the default parameters (density = "NORM", order = "PUB"). */
  constructor() {
    this.density = "NORM";
    this.sortOrder = "PUB";
    this.ascending = true;
  }

  setDensity(dense: "NORM" | "DENSE") {
    this.density = dense;
    return this;
  }
  setOrder(ord: "PUB" | "A-Z") {
    this.sortOrder = ord;
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
        submit: (data: SearchRequest) => Promise<{ appearances: AppearanceData[]; character: string }>;
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
      filterOptions: (state: FilterOptions) => Promise<AppearanceData[]>;
      recieveData: (callback: (res: any) => any) => void;
      dataRequest: (data: any) => void;
    };
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
  closeWarning: string;
  unimplemented: string;
  illegalFileType: string;
}

export enum AppPage {
  StartPage = "start.html",
  Application = "app.html",
  Settings = "settings.html",
}

// Cursed way to kinda emulate rust enums
export namespace AppPage {
  export function from(pg: string): Option<AppPage> {
    // It's like a shitty match statement :D (visually not under the hood)
    if (pg.includes("start") || pg.includes("start.html")) return new Some(AppPage.StartPage);
    else if (pg.includes("app") || pg.includes("app.html")) return new Some(AppPage.Application);
    else if (pg.includes("settings") || pg.includes("settings.html")) return new Some(AppPage.Settings);
    else return new None();
  }
}
