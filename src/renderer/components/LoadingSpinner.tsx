import { JSX } from "react";
import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  style?: React.CSSProperties;
  className?: string;
}

export default function LoadingSpinner({ style, className }: LoadingSpinnerProps): JSX.Element {
  return <div className={["loader", className].filter(Boolean).join(" ")} style={style} />;
}
