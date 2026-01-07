import React, { JSX, ReactNode } from "react";
import "../stylesheets/ToolTip.css";

interface ToolTipProps {
  children: ReactNode;
  value: string;
  orientation?: Orientation;
  style?: React.CSSProperties;
}

export enum Orientation {
  Above,
  Below,
  Left,
  Right,
}

// TODO: Text can say "What data is shared" or something

export default function ToolTip({ children, value, orientation, style = {} }: ToolTipProps): JSX.Element {
  // FIXME: This needs minor tweaking so it doesn't overwrite passed styles
  switch (orientation) {
    case Orientation.Below: {
      style.top = "110%";
      style.left = "50%";
      style.transform = "translateX(-50%)";
      break;
    }
    case Orientation.Left: {
      style.right = "110%";
      style.top = "50%";
      style.transform = "translateY(-50%)";
      break;
    }
    case Orientation.Right: {
      style.left = "110%";
      style.top = "50%";
      style.transform = "translateY(-50%)";
      break;
    }
    // Above is the base case
    default: {
      style.bottom = "150%";
      style.left = "50%";
      style.transform = "translateX(-50%)";
      break;
    }
  }

  return (
    <div className="ToolTip">
      {children}
      <span className="tooltiptext" style={style}>
        {value}
      </span>
    </div>
  );
}
