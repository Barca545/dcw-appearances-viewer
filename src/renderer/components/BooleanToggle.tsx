import { JSX } from "react";
import "./BooleanToggle.css";
import type { InputChangeEventInput } from "./types";

interface BooleanToggleProps {
  onChange?: (e: InputChangeEventInput) => void;
  checked?: boolean;
}

export default function BooleanToggle({ onChange, checked }: BooleanToggleProps): JSX.Element {
  return (
    <label className="switch">
      <input type="checkbox" onChange={onChange} checked={checked} />
      <span className="slider" />
    </label>
  );
}
