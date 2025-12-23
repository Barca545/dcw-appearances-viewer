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
// - Closing a tab ruins navigation.
//   - It might be possible it creates a new ID in a weird way

// - Add logging renderer errors and sending logs to cloudflare

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
    window.API.tabBar.requestTabBarState().then((update) => setTabs(update));
    window.API.tabBar.onUpdate((update) => setTabs(update));
    window.API.tab.go((tab) => navigate(tab));
  }, []);

  // Render the tabs in routes
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {tabs?.list.map((tab) => {
          if (tab.TabType == "APP") {
            return <Route key={tab.meta.ID} path={`/${tab.meta.ID}`} element={<App ID={tab.meta.ID} />} />;
          } else if (tab.TabType == "START") {
            return <Route key={tab.meta.ID} path={`/${tab.meta.ID}`} element={<Start />} />;
          } else if (tab.TabType == "SETTINGS") {
            return <Route key={tab.meta.ID} path={`/${tab.meta.ID}`} element={<AppSettings ID={tab.meta.ID} />} />;
          }
        })}
      </Route>
    </Routes>
  );
}
