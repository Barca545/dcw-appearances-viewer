import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter as Router, Routes, Route } from "react-router";
import Layout from "./Layout";
import Start from "./Start";
import AppSettings from "./AppSettings";
import ErrorBoundry from "./components/ErrorBoundry";
import * as Sentry from "@sentry/electron/renderer";
import { init as reactInit } from "@sentry/react";

// TODO: Do I still need the error boundry?

Sentry.init(
  {
    // TODO: Disable in production
    debug: true,
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/electron/configuration/options/#sendDefaultPii
    // sendDefaultPii: true,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: 1.0,
  },
  reactInit,
);

// FIXME:
// - The components on the app page need to be locked in place
// - Add logging renderer errors and sending logs to cloudflare
//   - New LogFile should be created each update
// - Tab bar should be scrollable with mouse
// - Settings should be marked as dirty on change not on save
// - Cannot close start tab
// - Everything not saved mainside will be obliterated when tabs switch
// - Display options are not working
// - Requests and updates should be decoupled because async nonsense
// - TODO: I need a more robust error notification

// TODO:
// Get out the door, final steps
// - Fix basic formatting of the app page so each component is static
// - add remote error reporting
// - Add auto updates

const root = createRoot(
  document.getElementById("root") as HTMLElement /*{
  onUncaughtError:Sentry.reactErrorHandler((error, errorInfo) => {
    console.warn("Uncaught error", error, errorInfo.componentStack);
  }),
  onCaughtError:Sentry.reactErr
}*/,
);

root.render(
  <React.StrictMode>
    <ErrorBoundry fallback={<div>An error has occured. Please submit an error report from the "Help" tab.</div>}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="app/:ID" element={<App />} />
            <Route path="settings/:ID" element={<AppSettings />} />
            <Route path="start/:ID" element={<Start />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundry>
  </React.StrictMode>,
);
