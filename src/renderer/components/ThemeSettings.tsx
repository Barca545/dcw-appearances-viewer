import { FormEventHandler, JSX } from "react";
import { SettingsTheme } from "../../main/settings";

interface ThemeSettingsProps {
  value: SettingsTheme;
  onChange: FormEventHandler;
}

export default function ThemeSettings({ value, onChange }: ThemeSettingsProps): JSX.Element {
  return (
    <fieldset className="settings-subsection" id="Theme">
      <legend className="settings-subsection-title">Theme</legend>
      <label className="theme-label" htmlFor="theme:system">
        System
      </label>
      <input
        type="radio"
        id="theme:system"
        name="theme"
        value={SettingsTheme.System}
        checked={value == SettingsTheme.System}
        onChange={onChange}
      />
      <label className="theme-label" htmlFor="theme:dark">
        Dark
      </label>
      <input
        type="radio"
        id="theme:dark"
        name="theme"
        value={SettingsTheme.Dark}
        checked={value == SettingsTheme.Dark}
        onChange={onChange}
      />
      <label className="theme-label" htmlFor="theme:light">
        Light
      </label>
      <input
        type="radio"
        id="theme:light"
        name="theme"
        value={SettingsTheme.Light}
        checked={value == SettingsTheme.Light}
        onChange={onChange}
      />
    </fieldset>
  );
}
