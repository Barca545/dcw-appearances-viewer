import { ListEntry } from "../../core/pub-sort";

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
      // TODO: This is now folded into settings so no need for separate
      darkMode: {
        toggle: () => void;
        system: () => void;
      };
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
        /**Open a Page in the current window. */
        page: (addr: AppPage) => void;
        /**Open a Web URL in the default browser. */
        url: (addr: string) => void;
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
}

export enum AppPage {
  StartPage = "start.html",
  Application = "app.html",
  Settings = "settings.html",
}

// Cursed way to kinda emulate rust enums
export namespace AppPage {
  export function from(pg: string): AppPage {
    // It's like a shitty match statement :D (visually not under the hood)
    if (pg.includes("start") || pg.includes("start.html")) return AppPage.StartPage;
    else if (pg.includes("app") || pg.includes("app.html")) return AppPage.Application;
    else if (pg.includes("settings") || pg.includes("settings.html")) return AppPage.Settings;
    else throw Error(`INVALID NAVIGATION TARGET: ${pg}`);
  }
}

// export class AppPage {
//   // This is pretty hacky but basically this should allow me to make it via "from"
//   // instead of the constructor
//   // declare makes a gaurantee the PAGE value will exist at runtime
//   // See https://stackoverflow.com/questions/67351411/what-s-the-difference-between-definite-assignment-assertion-and-ambient-declarat
//   PAGE: "start.html" | "app.html" | "settings.html";

//   private constructor(pg: string) {
//     if (pg.includes("start") || pg.includes("start.html")) {
//       this.PAGE = "start.html";
//     } else if (pg.includes("app") || pg.includes("app.html")) {
//       this.PAGE = "app.html";
//     } else if (pg.includes("settings") || pg.includes("settings.html")) {
//       this.PAGE = "settings.html";
//     } else {
//       throw Error(`INVALID NAVIGATION TARGET: ${pg}`);
//     }
//   }

//   static from(pg: string): AppPage {
//     return new AppPage(pg);
//   }
// }

// FIXME: App data should be this not the nonsense in load.ts
interface ProjectData {
  header: { appID: "DCDDB-Appearances-View"; version: string };
  meta: { character?: string; options: FilterOptions };
  data: ListEntry[];
}
