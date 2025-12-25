import React, { JSX, useEffect, useState } from "react";
import { Settings, SettingsTheme } from "../common/apiTypes";
import "../renderer/settings.css";
import { TabID } from "../common/ipcAPI";
import LoadingSpinner from "./components/LoadingSpinner";
import AccessibilitySettings from "./components/AccessibilitySettings";
import ThemeSettings from "./components/ThemeSettings";
import SaveSettings from "./components/SaveSettings";
import { useParams } from "react-router";

// TODO: Settings do not seem to be updateing

export default function AppSettings() {
  const { ID } = useParams<Record<"ID", TabID>>();
  if (ID == undefined) {
    throw new Error("Tab must have an ID.");
  }

  const [settings, setSettings] = useState<null | Settings>(null);

  useEffect(() => {
    window.API.settingsTab.request().then((state) => setSettings(state));

    return window.API.settingsTab.onUpdate((state) => setSettings(state.settings));
  }, []);

  if (!settings) {
    return <LoadingSpinner />;
  }

  const handleSave = async () => setSettings(await window.API.settingsTab.save({ ID, settings }));

  const handleReset = async () => setSettings(await window.API.settingsTab.reset());

  const handleSaveAndClose = () => {
    handleSave();
    window.API.tabBar.closeTab(ID);
  };

  const handleClose = () => window.API.tabBar.closeTab(ID);

  const handleThemeChange = (e: React.FormEvent<HTMLInputElement>) =>
    setSettings({ ...settings, theme: e.currentTarget.value as SettingsTheme });

  const handleSaveFrequencyChange = (value: string) =>
    setSettings({ ...settings, saveSettings: { ...settings.saveSettings, autosaveFrequency: value } });

  const handleSaveOnBlurChange = (value: boolean) =>
    setSettings({ ...settings, saveSettings: { ...settings.saveSettings, saveOnBlur: value } });

  const handleAutosaveChange = (value: boolean) => {
    setSettings({ ...settings, saveSettings: { ...settings.saveSettings, autosave: value } });
  };

  const handleChangeFontSize = (value: string) => setSettings({ ...settings, fontSize: value });

  return (
    <form id="settings" className="settings-form">
      <ThemeSettings value={settings.theme} onChange={handleThemeChange} />
      <SaveSettings
        saveOnBlur={settings.saveSettings.saveOnBlur}
        onSaveOnBlurChange={handleSaveOnBlurChange}
        onSaveFrequencyChange={handleSaveFrequencyChange}
        autosave={settings.saveSettings.autosave}
        onAutosaveChange={handleAutosaveChange}
        saveFrequency={settings.saveSettings.autosaveFrequency}
      />
      <AccessibilitySettings fontSize={settings.fontSize} setFontSize={handleChangeFontSize} />
      <fieldset className="settings-subsection" id="save-buttons">
        <button type="button" id="save" className="save-button" name="save-settings" onClick={handleSave}>
          Save
        </button>
        <button type="button" id="save-and-close" className="save-button" name="save-settings" onClick={handleSaveAndClose}>
          Save and Close
        </button>
        <button type="button" id="save-and-close" className="save-button" name="save-settings" onClick={handleClose}>
          Close
        </button>
        <button type="button" id="reset" className="save-button" onClick={handleReset}>
          Reset Settings
        </button>
      </fieldset>
    </form>
  );
}

function WindowSize(): JSX.Element {
  // TODO: Rename this from window size and also add settings for windowed, fullscreen, etc
  return (
    <fieldset className="settings-subsection" id="WindowSize">
      <legend className="settings-subsection-title">Window Dimensions</legend>
      <label htmlFor="width">Width</label>
      <input id="width" type="number" min="0" name="width" />
      <label htmlFor="height">Height</label>
      <input id="height" type="number" min="0" name="height" />
    </fieldset>
  );
}

function UpdatePreferences(): JSX.Element {
  return (
    <fieldset className="settings-subsection">
      <legend className="settings-subsection-title">Update Preferences</legend>
      <label htmlFor="update-frequency"></label>
      <select name="update-frequency">
        <option value={"nightly"}>Nightly</option>
        <option value={"major"}>Major</option>
        <option value={"prompt"}>Prompt</option>
      </select>
    </fieldset>
  );
}
