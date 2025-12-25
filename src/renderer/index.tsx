import React, { JSX, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter as Router, Routes, Route, useNavigate } from "react-router";
import Layout from "./Layout";
import Start from "./Start";
import AppSettings from "./AppSettings";
import { SerializedTabBarState } from "../common/ipcAPI";

// FIXME:
// - The components on the app page need to be locked in place
// - Update the API, each page type needs its own dedicated sub api
//   - Make sub apis in preload
//   - Make sub apis in session
//   - Fill out documentation
// - Add logging renderer errors and sending logs to cloudflare
//   - New LogFile should be created each update
// - Tab bar should be scrollable with mouse
// - Settings should be marked as dirty on change not on save
// - Might be possible to get rid of the datatab stuff since a lot of that logic is no longer shared otoh might eventually use it
// - Some changes to tab on the main side do not cause render-side tab logic to change
//   - Creating a settings tab does not cause a tabbar rerender or navigation until after the new tab button is pressed
//   - Start tab buttons do not immediately load a new tab
// - App tab is not showing the results

const root = createRoot(document.getElementById("root") as HTMLElement);
// Be cool if I could use a local context for the tab bar not a full store just something more straightforward
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
