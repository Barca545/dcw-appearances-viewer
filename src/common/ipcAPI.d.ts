import type { Settings, TabData, SearchRequest, AppPage, FilterOrder, FilterDensity } from "./apiTypes";

declare global {
  interface Window {
    API: {
      settings: {
        request: () => Promise<Settings>;
        /**Save the new settings to the disk. */
        save: (data: Settings) => void;
        /**Send settings data to the main process without saving it to file. */
        apply: (data: Settings) => void;
      };
      /**Updata data for a tab. */
      update: {
        /**Submits the form to the main process and returns the result to the renderer. */
        request: (data: SearchRequest) => Promise<TabData>;

        recieve: (u: (data: TabData) => void) => void;
      };
      open: {
        /**Open a new `AppPage` in the current tab. */
        page: (addr: AppPage) => void;
        /**Open a Web URL in the default browser. */
        url: (addr: string) => void;
        // TODO: Eventually should open in a new tab
        /**Open a project file in the current tab. */
        file: () => void;
      };
      /**Update the `FilterOptions` stored in the main process. */
      filter: {
        /**Set a new value for the App's filter order. */
        order: (order: FilterOrder) => void;
        /**Set a new value for the App's filter density. */
        density: (density: FilterDensity) => void;
        /**Set a new value for the App's filter ascent direction. */
        ascending: (asc: boolean) => void;
      };
    };
  }
}
