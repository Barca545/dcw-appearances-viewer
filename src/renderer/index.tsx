import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter as Router, Routes, Route } from "react-router";
import Layout from "./Layout";
import Start from "./Start";
import AppSettings from "./AppSettings";

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

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="app/:ID" element={<App />} />
          <Route path="settings/:ID" element={<AppSettings />} />
          <Route path="start/:ID" element={<Start />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>,
);
