import { JSX } from "react";
import "./BooleanToggle.css";
import type { InputChangeEventInput } from "./types";

interface BooleanToggleProps {
  onChange?: (e: InputChangeEventInput) => void;
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
