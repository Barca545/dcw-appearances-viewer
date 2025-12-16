import React, { JSX, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter as Router, Routes, Route } from "react-router";
import Layout from "./Layout";
import Start from "./Start";
import { SerializedTabBarState } from "src/common/ipcAPI";

// FIXME:
// - TabBar styling is all gone
// - New Tab button does not work
// - Creates them on main but nothing updates serversuide
// - Updating the selected tab fails
// - Saving a file in VSC seems to make new Tabs
//   - This suggests when the tabBar loads it creates tabs
// - Add scrollbar to TabBar
// - Style the add tab button
// - Add functionality to close tabs
// - Don't automatically redirect to the selected page tabroutes probably needs a go listener

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

  useEffect(() => {
    window.API.tabBar.requestTabBarState().then((update) => setTabs(update));
    window.API.tabBar.update((update) => setTabs(update));
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
          }
        })}
      </Route>
    </Routes>
  );
}
