import { JSX } from "react";
import "./BooleanToggle.css";

interface BooleanToggleProps {
  id?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
  disabled?: boolean;
}

export default function BooleanToggle({ id, onChange, checked, className, disabled }: BooleanToggleProps): JSX.Element {
  return (
    <label id={id} className={["switch", className].filter(Boolean).join(" ")}>
      <input type="checkbox" onChange={onChange} checked={checked} disabled={disabled} />
      <span className="slider" />
    </label>
  );
}
