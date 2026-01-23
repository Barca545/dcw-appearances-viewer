import { fieldExists } from "../common/utils";
import { Option, Some, None } from "../../core/option";
import { __userdata } from "./utils";

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

export enum UpdateChannel {
  Prerelease = "PRERELEASE",
  Major = "MAJOR",
  Minor = "MINOR",
}

interface SaveSettings {
  saveOnBlur: boolean;
  autosave: boolean;
  /**How often the application should autosave in milliseconds. */
  autosaveFrequency: number;
}

interface UpdateSettings {
  updateChannel: UpdateChannel;
  updatePromptBefore: boolean;
  /**Whether the app should check for updates while the app is running after startup. */
  autoCheckForUpdates: boolean;
  /**How often the application should check for updates in milliseconds. */
  updateCheckInterval: number;
}

// TODO: Should these be read only?
export interface Settings {
  theme: SettingsTheme;
  width: number;
  height: number;
  fontSize: number;
  saveSettings: SaveSettings;
  updateSettings: UpdateSettings;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: SettingsTheme.System,
  width: 900,
  height: 800,
  fontSize: 16,
  saveSettings: {
    saveOnBlur: true,
    autosave: true,
    autosaveFrequency: 120000, // 2 minutes
  },
  updateSettings: {
    updateChannel: UpdateChannel.Prerelease,
    updatePromptBefore: true,
    autoCheckForUpdates: true,
    updateCheckInterval: 3600000, // 1 hour
  },
};

export function isSettings(object: any): object is Settings {
  return Object.entries(DEFAULT_SETTINGS).every(([k, v]) => fieldExists(object, k, typeof v));
}
