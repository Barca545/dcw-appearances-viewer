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
        update: (data: Settings) => void;
      };

      form: {
        /**Submits the form to the main process and returns the result to the renderer. */
        submit: (data: SearchRequest) => Promise<{ appearances: AppearanceData[]; character: string }>;
      };
      open: {
        page: (addr: string) => void;
        url: (addr: string) => void;
      };

      filterOptions: (state: FilterOptions) => Promise<AppearanceData[]>;
      recieveData: (callback: (res: any) => any) => void;
    };
  }
}

export interface Settings {
  theme: "system" | "light" | "dark";
  "choose-earth-settings": "user" | "dropdown";
  "open in new window": boolean;
  size: { width: number; height: number };
}

/**Interface containing the data used to construct a list entry. The return result of window.api.form.submit */
export interface AppearanceData {
  title: string;
  synopsis: string;
  date: { year: number; month: number; day: number };
  link: string;
}

// TODO: List entry should be in shared?
