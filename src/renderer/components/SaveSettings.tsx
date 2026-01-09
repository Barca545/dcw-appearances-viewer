import { JSX, useState } from "react";
import BooleanToggle from "./BooleanToggle";

interface SaveSettingsProps {
  autosave: boolean;
  onAutosaveChange: (value: boolean) => void;
  saveOnBlur: boolean;
  onSaveOnBlurChange: (value: boolean) => void;
  saveFrequency: number;
  onSaveFrequencyChange: (value: string) => void;
}

export default function SaveSettings({
  autosave,
  onAutosaveChange,
  saveOnBlur,
  onSaveOnBlurChange,
  saveFrequency,
  onSaveFrequencyChange: setSaveFrequency,
}: SaveSettingsProps): JSX.Element {
  const [minutes, setMinutes] = useState(Math.floor(saveFrequency / 1000 / 60));
  const [seconds, setSeconds] = useState((saveFrequency / 1000) % 60);

  const handleFrequencyMinutesChange = (e: React.FormEvent<HTMLInputElement>) => {
    setMinutes(Number.parseInt(e.currentTarget.value));
    setSaveFrequency(minutesAndSecondsToMilliseconds());
  };
  const handleFrequencySecondsChange = (e: React.FormEvent<HTMLInputElement>) => {
    setSeconds(Number.parseInt(e.currentTarget.value));
    setSaveFrequency(minutesAndSecondsToMilliseconds());
  };

  function minutesAndSecondsToMilliseconds(): string {
    return (minutes * 60 * 1000 + seconds * 1000).toString();
  }

  return (
    <fieldset className="settings-subsection">
      <legend className="settings-subsection-title">Save Settings</legend>
      <label htmlFor="autosave">Autosave</label>
      <BooleanToggle id="autosave" checked={autosave} onChange={(e) => onAutosaveChange((e.currentTarget as HTMLInputElement).checked)} />
      <label htmlFor="autosave-frequency">Autosave Frequency</label>
      <span id="autosave-frequency">
        <input
          disabled={!autosave}
          id="autosave-frequency-mm"
          name="autosave-frequency-mm"
          type="number"
          placeholder="MM"
          min={0}
          onChange={handleFrequencyMinutesChange}
        />
        <input
          disabled={!autosave}
          id="autosave-frequency-mm"
          name="autosave-frequency-ss"
          type="number"
          placeholder="SS"
          min={0}
          onChange={handleFrequencySecondsChange}
        />
      </span>
      <label htmlFor="save-on-blur">Save on Blur</label>
      <BooleanToggle
        id="save-on-blur"
        checked={saveOnBlur}
        onChange={(e) => onSaveOnBlurChange((e.currentTarget as HTMLInputElement).checked)}
      />
    </fieldset>
  );
}
