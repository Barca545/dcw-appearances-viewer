import { JSX } from "react";

interface AccessibilitySettingsProps {
  fontSize: string;
  setFontSize: (value: string) => void;
}

export default function AccessibilitySettings({ fontSize, setFontSize }: AccessibilitySettingsProps): JSX.Element {
  return (
    <fieldset className="settings-subsection" id="display">
      <legend className="settings-subsection-title">Display</legend>
      <label htmlFor="font-size">Font Size</label>
      <input
        type="number"
        min="16"
        id="font-size"
        name="font-size"
        value={fontSize}
        onChange={(e) => setFontSize(e.currentTarget.value)}
      />
    </fieldset>
  );
  // return (
  //   <fieldset id="settings-accessibility">
  //     <legend className="settings-subsection-title">Accessibility Options</legend>
  //     <fieldset className="settings-subsection" id="screen-reader">
  //       <legend className="settings-subsection-title">Screen Reader Support</legend>
  //     </fieldset>
  //     <fieldset className="settings-subsection" id="ease-of-access">
  //       <legend className="settings-subsection-title">Ease of Access</legend>
  //     </fieldset>
  //     <fieldset className="settings-subsection" id="display">
  //       <legend className="settings-subsection-title">Display</legend>
  //       <label htmlFor="font-size" />
  //       <input type="number" min="16" id="font-size" name="font-size" />
  //       <label htmlFor="high-contrast" />
  //       <div id="high-contrast">UNIMPLEMENTED</div>
  //     </fieldset>
  //   </fieldset>
  // );
}
