import { DEFAULT_SETTINGS, isSettings, Settings } from "./settings";
import fs from "node:fs";
// import { create_settings_file } from "./utils";
import os from "node:os";
import path from "node:path";
import { fieldExists } from "../common/utils";
import deepmerge from "./deepmerge";

// TODO: If settings.json has fields the interface lacks delete those

// This can't rely on app because it runs before app.isReady == true
// TODO: This feels like it should be somewhere else
function getUserDataPath(appName: string): string {
  const home = os.homedir();

  switch (process.platform) {
    case "win32":
      return path.join(process.env.APPDATA || path.join(home, "AppData", "Roaming"), appName);
    case "darwin":
      return path.join(home, "Library", "Application Support", appName);
    case "linux":
      return path.join(process.env.XDG_CONFIG_HOME || path.join(home, ".config"), appName);
    default:
      throw new Error("Unsupported platform");
  }
}

// Use this before app is ready
export const __userdata = getUserDataPath("dcdb-appearance-viewer");
const SETTINGS_PATH = path.join(__userdata, "settings.json");

/**Confirms the user's settings file contains all the fields as the DEFAULT_SETTINGS.
 * If user's settings file is missing fields,
 * create the field and set it to the default value.
 * Does not modify in place.
 * Used to ensure the settings file is up to date after an update.
 * - current is the user's current settings file.
 * - update is the new standard settings file.*/
export function reconcileSettings(current?: Record<string, any>, update?: Settings, shouldWrite = true): Settings {
  current = current ? current : (JSON.parse(fs.readFileSync(SETTINGS_PATH, { encoding: "utf-8" })) as Object);
  update = update ? update : DEFAULT_SETTINGS;

  // If the "new" settings and the current settings are in sync early return
  if (isSettings(current)) return current as Settings;

  // Make a clone of the new settings
  let res = JSON.parse(JSON.stringify(update)) as typeof update;

  // If the old settings already have a value for a setting
  // (and it is still a valid state for the setting) overwrite it
  for (const [key, val] of Object.entries(res)) {
    const ty = typeof val;

    // If the field fully does not exist or the types differ, skip
    if (!(key in current)) {
      continue;
    }
    // If the field has the same key, typeof val,
    // copy from the current settings file
    else if (fieldExists(current, key, ty)) {
      res = Object.defineProperty(res, key, { value: current[key], enumerable: true });
    }
    // If the field does not match exactly and is an object
    // copy the fields that exist
    else if (typeof val === "object") {
      const value = deepmerge(current[key], val);
      res = Object.defineProperty(res, key, { value, enumerable: true });
    }
    // This doesn't need to be an arm but it is the behavior
    // if typeof current[key] !== typeof res[key as keyof Settings]
    // continue
  }

  if (shouldWrite) {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(current, null, 2), { encoding: "utf-8" });
  }

  return res as Settings;
}

// TODO: Having to duplicate this is gross, ideally
/**Function for creating a settings file during installation.
 * Returns the new settings.
 */
export function create_settings_file(): Settings {
  // Create the userdata file if it does not exist
  if (!fs.existsSync(__userdata)) {
    fs.mkdirSync(__dirname, { recursive: true });
  }
  // The version in utils has a check for the existence of settings.json but that is unnecessary here
  return JSON.parse(fs.readFileSync(SETTINGS_PATH, { encoding: "utf-8" }));
}

export function handleStartupEvent() {
  // Ensure settings.json exists
  // if (!fs.existsSync(SETTINGS_PATH)) {
  //   create_settings_file();
  // }
  // // Ideally this only runs after an update aside from putting it in the nsis script which I doubt I can do
  // else {
  //   reconcileSettings();
  // }
}
