import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter as Router, Routes, Route } from "react-router";
import Layout from "./Layout";
import Start from "./Start";
import { Provider } from "react-redux";
import { store } from "./store/store";

console.log("INDEX STARTS");

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Start />} />
            <Route path="/app" element={<App />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  </React.StrictMode>,
);
