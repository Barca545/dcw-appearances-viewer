import test from "node:test";
// import { appUpdater } from "../src/main/autoupdate";
import { reconcileSettings } from "../src/main/startup";
import { DEFAULT_SETTINGS, SettingsTheme, UpdateChannel } from "../src/main/settings";
import { isEqual } from "lodash-es";
import assert from "node:assert";
// TODO: Test for pulling from releases using a private dummy update repo

// TODO: Test for the should update method working

// Test that reconcileSettings:
// - leaves existing properties alone
// - assigns missing properties
test("settings reconcile", (_t) => {
  let current = {
    theme: SettingsTheme.Dark,
    width: 5,
    height: 10,
    fontSize: 6,
    saveSettings: {
      saveOnBlur: false,
      autosave: false,
    },
  };

  const testVal = reconcileSettings(current, DEFAULT_SETTINGS, false);
  const expected = {
    theme: SettingsTheme.Dark,
    width: 5,
    height: 10,
    fontSize: 6,
    saveSettings: {
      saveOnBlur: false,
      autosave: false,
      autosaveFrequency: 120000, // 2 minutes
    },
    updateSettings: {
      updateChannel: UpdateChannel.Prerelease,
      updatePromptBefore: true,
      autoCheckForUpdates: true,
      updateCheckInterval: 3600000, // 1 hour
    },
  };

  return assert(isEqual(JSON.stringify(testVal), JSON.stringify(expected)));
});

// TODO: Add handleStartupEvent test
