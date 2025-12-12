import React, { JSX, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter as Router, Routes, Route } from "react-router";
import Layout from "./Layout";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { selectAllTabs, updateEntry } from "./store/listStateSlice";
import { SerializedAppTab, SerializedStartTab, TabDataUpdate } from "../common/TypesAPI";
import Start from "./Start";

// I think here is where I need to listen for tab updates anre rerender the tabs

// TODO: I think here is maybe where I can register the listeners the whole app will use?
// window.addEventListener("");

/**[Type guard](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards) to check whether a `TabDataUpdate` is a `SerializedAppTab`.*/
function isSerializedAppTab(tab: TabDataUpdate): tab is SerializedAppTab {
  return (tab as SerializedAppTab) != undefined;
}

/**[Type guard](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards) to check whether a `TabDataUpdate` is a `SerializedStartTab`.*/
function isSerializedStartTab(tab: TabDataUpdate): tab is SerializedStartTab {
  return (tab as SerializedStartTab) != undefined;
}

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <TabBodies />
      </Router>
    </Provider>
  </React.StrictMode>,
);

function TabBodies(): JSX.Element {
  const tabs = useAppSelector(selectAllTabs);
  const dispatch = useAppDispatch();

  useEffect(() => {
    window.API.tab.update((update) => {
      console.log(update);
      dispatch(updateEntry(update));
    });
  }, []);

  // Render the tavs in routes
  return (
    <Routes>
      <Route path="/" element={<Layout />}></Route>
      {tabs.map((tab) => {
        if (isSerializedAppTab(tab)) {
          return <Route path={`/${tab.meta.ID}`} element={<App ID={tab.meta.ID} />} />;
        } else if (isSerializedStartTab(tab)) {
          return <Route path={`/${tab.meta.ID}`} element={<Start />} />;
        }
      })}
    </Routes>
  );
}
