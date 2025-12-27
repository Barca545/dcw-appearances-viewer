import React, { ErrorInfo, JSX } from "react";
// import { LogLevel } from "../../main/log";

// This cannot be imported from main log level because log level uses __dirname
export enum LogLevel {
  /**Significant events. */
  Info = "INFO",
  /**Abnormal situations that may indicate future problems. */
  Warn = "WARN",
  /**Unrecoverable errors that affect a specific operation. */
  Error = "ERROR",
  /**Unrecoverable errors that affect the entire program. */
  Fatal = "FATAL",
}

interface Props {
  /** Element to display in the case of an error.*/
  fallback: JSX.Element;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundry extends React.Component<Props, State> {
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // FIXME: Because JS is stupid, I have to handle the case where error is not an Error
    // TODO: I need to see what info.componentStack and React.captureOwnerStack() return so I can figure out the pest way of merging them into a message.

    window.ERROR.log({
      time: new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hourCycle: "h12",
      }).format(new Date()),
      level: LogLevel.Error,
      name: error.name,
      stack: error.stack,
      componentStack: info.componentStack,
      ownerStack: React.captureOwnerStack(),
      message: error.message,
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}
