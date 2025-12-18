import { JSX } from "react";
import "./BooleanToggle.css";

interface BooleanToggleProps {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
  className?: string;
}

export default function BooleanToggle({ onChange, checked, className }: BooleanToggleProps): JSX.Element {
  return (
    <label className={["switch", className].filter(Boolean).join(" ")}>
      <input type="checkbox" onChange={onChange} checked={checked} />
      <span className="slider" />
    </label>
  );
}
