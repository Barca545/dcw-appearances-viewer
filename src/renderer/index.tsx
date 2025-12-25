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
// - Settings should be marked as dirty on change
// - Might be possible to get rid of the datatab stuff since a lot of that logic is no longer shared otoh might eventually use it

// TODO:
// - I wish there was a way to tie the route creation to the tabbar creation

// contains origin location
// error.stack;

const root = createRoot(document.getElementById("root") as HTMLElement);
// Be cool if I could use a local context for the tab bar not a full store just something more straightforward
root.render(
  <React.StrictMode>
    <Router>
      <TabRoutes />
    </Router>
  </React.StrictMode>,
);

function TabRoutes(): JSX.Element {
  const [tabs, setTabs] = useState<SerializedTabBarState | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleChange = (state: SerializedTabBarState) => {
      setTabs(state);
      navigate(state.selected);
    };

    window.API.tabBar.request().then(handleChange);
    return window.API.tabBar.onUpdate(handleChange);
  }, []);

  // Render the tabs in routes
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {tabs?.list.map((tab) => {
          if (tab.TabType == "APP") {
            return <Route key={tab.meta.ID} path={`/${tab.meta.ID}`} element={<App ID={tab.meta.ID} />} />;
          } else if (tab.TabType == "START") {
            return <Route key={tab.meta.ID} path={`/${tab.meta.ID}`} element={<Start ID={tab.meta.ID} />} />;
          } else if (tab.TabType == "SETTINGS") {
            return <Route key={tab.meta.ID} path={`/${tab.meta.ID}`} element={<AppSettings ID={tab.meta.ID} />} />;
          }
        })}
      </Route>
    </Routes>
  );
}
