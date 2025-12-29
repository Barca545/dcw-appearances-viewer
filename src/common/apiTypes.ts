import { None, Option, Some } from "../../core/option";

export enum DisplayDensity {
  Normal = "NORM",
  Dense = "DENSE",
}

export namespace DisplayDensity {
  export function from(value: string): Option<DisplayDensity> {
    switch (value.toUpperCase()) {
      case "DENSE": {
        return new Some(DisplayDensity.Dense);
      }
      case "NORM": {
        return new Some(DisplayDensity.Normal);
      }
    }
    return new None();
  }
}

export enum DisplayOrder {
  PubDate = "PUB",
  AlphaNumeric = "A-Z",
}

export namespace DisplayOrder {
  export function from(value: string): Option<DisplayOrder> {
    switch (value) {
      case "A-Z": {
        return new Some(DisplayOrder.AlphaNumeric);
      }
      case "PUB": {
        return new Some(DisplayOrder.PubDate);
      }
    }
    return new None();
  }
}

export enum DisplayDirection {
  Ascending,
  Descending,
}

export namespace DisplayDirection {
  export function from(value: boolean): DisplayDirection {
    if (value) return DisplayDirection.Ascending;
    else return DisplayDirection.Descending;
  }
}

export interface DisplayOptions {
  order: DisplayOrder;
  density: DisplayDensity;
  dir: DisplayDirection;
}

export const DEFAULT_FILTER_OPTIONS: DisplayOptions = {
  order: DisplayOrder.PubDate,
  density: DisplayDensity.Normal,
  dir: DisplayDirection.Ascending,
};

export enum SettingsTheme {
  System = "system",
  Light = "light",
  Dark = "dark",
}

export namespace SettingsTheme {
  export function from(value: string): Option<SettingsTheme> {
    switch (value) {
      case SettingsTheme.System: {
        return new Some(SettingsTheme.System);
      }
      case SettingsTheme.Light: {
        return new Some(SettingsTheme.Light);
      }
      case SettingsTheme.Dark: {
        return new Some(SettingsTheme.Dark);
      }
      default: {
        return new None();
      }
    }
  }
}

export type UpdateChannel = "NIGHTLY" | "MAJOR" | "STABLE";

interface SaveSettings {
  saveOnBlur: boolean;
  autosave: boolean;
  /**How often the application should autosave in milliseconds. */
  autosaveFrequency: string;
}

export interface Settings {
  theme: SettingsTheme;
  width: string;
  height: string;
  fontSize: string;
  saveSettings: SaveSettings;
  updateChannel: UpdateChannel;
  updatePromptBefore: boolean;
  /**Whether the app should check for updates while the app is running after startup. */
  autoCheckForUpdates: boolean;
  /**How often the application should check for updates in milliseconds. */
  updateCheckInterval: string;
}

export interface AppMessages {
  unsavedChanges: string;
  unimplemented: string;
  illegalFileType: string;
  DevContact: string;
}
