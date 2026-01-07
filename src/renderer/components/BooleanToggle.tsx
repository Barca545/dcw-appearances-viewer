import { JSX } from "react";
import "./BooleanToggle.css";
// FIXME: There may be an issue with this toggle
interface BooleanToggleProps {
  id?: string;
  name?: string;
  className?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler;
}

export default function BooleanToggle({ id, name, checked, className, disabled, onChange }: BooleanToggleProps): JSX.Element {
  return (
    <label id={id} className={["switch", className].filter(Boolean).join(" ")}>
      <input type="checkbox" name={name} onChange={onChange} checked={checked} disabled={disabled} />
      <span className="slider" />
    </label>
  );
}
