import React, { JSX, useEffect, useState } from "react";
import BooleanToggle from "../renderer/components/BooleanToggle";
import { Settings } from "../common/apiTypes";
// TODO: Why is the window.API not availible here

// TODO: Setting should always open in new window
// TODO: I don't think I'm doing these field components properly.
// I am not actually sure each field should be its own component even if I like modularizing it

export default function Settings() {
  const [settings, setSettings] = useState<null>(null);

  useEffect(() => {
    // TODO: This needs to load the settings file from the main process
  });

  const handleSave = (e: FormData) => {
    // TODO: This needs to save the settings file to the main process
  };

  const handleSaveAndClose = (e: FormData) => {};

  const handleChange = (e: React.FormEvent) => {};

  return (
    <form id="settings" action={handleSave} onChange={handleChange}>
      <button type="button" id="save" className="save-button" name="save-settings">
        Save
      </button>
      <button type="button" id="save-and-close" className="save-button" name="save-settings">
        Save and Close
      </button>
      <button>Reset Settings</button>
    </form>
  );
}

function Theme(): JSX.Element {
  return (
    <fieldset className="settings-subsection" id="Theme">
      <legend className="settings-subsection-title">Theme</legend>
      <label className="theme-label" htmlFor="theme:system">
        System
      </label>
      <input type="radio" id="theme:system" name="theme" value="system" />
      <label className="theme-label" htmlFor="theme:dark">
        Dark
      </label>
      <input type="radio" id="theme:dark" name="theme" value="dark" />
      <label className="theme-label" htmlFor="theme:light">
        Light
      </label>
      <input type="radio" id="theme:light" name="theme" value="light" />
    </fieldset>
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

function SaveSettings({ shouldAutosave }: { shouldAutosave: boolean }): JSX.Element {
  const [checked, setChecked] = useState(shouldAutosave);

  return (
    <fieldset>
      <legend className="settings-subsection-title">Save Settings</legend>
      <label htmlFor="">Autosave</label>
      <input id="save-settings-autosave" name="" type="radio" />
      <label>Save on Blur</label>
      <BooleanToggle checked={checked} onChange={(e) => setChecked(e.currentTarget.checked)} />
    </fieldset>
  );
}

function Accessibility(): JSX.Element {
  return (
    <fieldset id="settings-accessibility">
      <legend className="settings-subsection-title">Accessibility Options</legend>
      <fieldset className="settings-subsection" id="screen-reader">
        <legend className="settings-subsection-title">Screen Reader Support</legend>
      </fieldset>
      <fieldset className="settings-subsection" id="ease-of-access">
        <legend className="settings-subsection-title">Ease of Access</legend>
      </fieldset>
      <fieldset className="settings-subsection" id="display">
        <legend className="settings-subsection-title">Display</legend>
        <label htmlFor="font-size" />
        <input type="number" min="16" id="font-size" name="font-size" />
        <label htmlFor="high-contrast" />
        <div id="high-contrast">UNIMPLEMENTED</div>
      </fieldset>
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

function htmlFormtoSettings(data: FormData): Settings {
  return {
    theme: data.get("theme") as "system" | "light" | "dark",
    width: data.get("width") as string,
    height: data.get("height") as string,
    fontSize: data.get("font-size") as string,
    updateFrequency: data.get("update-frequency") as "nightly" | "major" | "prompt",
  } satisfies Settings;
}
