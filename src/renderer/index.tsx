import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App1";
import { HashRouter as Router, Routes, Route } from "react-router";
import Layout from "./Layout";
import Start from "./Start1";
import { Provider } from "react-redux";
import { store } from "./store/store";

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Start />} />
            <Route path="/app" element={<App />} />
            {/* <Route path="settings" exact element="" /> */}
          </Route>
        </Routes>
      </Router>
    </Provider>
  </React.StrictMode>,
);
