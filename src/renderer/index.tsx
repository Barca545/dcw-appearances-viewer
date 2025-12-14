import React, { JSX, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter as Router, Routes, Route } from "react-router";
import Layout from "./Layout";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { selectAllTabs, updateEntry } from "./store/listStateSlice";
import { isSerializedAppTab } from "../common/TypesAPI";
import Start from "./Start";

// FIXME:
// - This is not properly labeling active tabs
// - This does not properly navigate to the active tab
// - Need to eliminate the store and have the active tab query the main process for its data on load/change
//  - Probably have a listener that listens for incoming updates as well and discards them if they do not match the current active tab
// - Add scrollbar to TabBar
// - Style the add tab button
// - Add functionality to close tabs

const handleNavigate = () =>{
  // update the active ID
  navigate(ID)
}

// Something like
useEffect(() => {
  window.API.tab.getData(ID);
}, []);

useEffect(() => {
  const update = window.API.tab.update();
  if update.ID == ID {
    setData( update.data)
  }
  return window.API.tab.update
}, []);

// When a change to the display options happens trigger the below
// Since the DisplayOptions are a separate component I want to make sure if there is a way to pass their changes up the ladder 
// memoize the callback?
// look into using debounce delay too

useEffect(()=>{
   setData( window.API.displayOptions.send()) 
},[opts])

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <TabRoutes />
      </Router>
    </Provider>
  </React.StrictMode>,
);

function TabRoutes(): JSX.Element {
  const tabs = useAppSelector(selectAllTabs);
  const dispatch = useAppDispatch();

  useEffect(() => {
    window.API.tab.update((update) => {
      dispatch(updateEntry(update));
    });
  }, []);

  const maptabs = () => {
    const t = tabs.map((tab) => {
      if (isSerializedAppTab(tab)) {
        return <Route key={tab.meta.ID} path={`/${tab.meta.ID}`} element={<App ID={tab.meta.ID} />} />;
      } else {
        console.log(tab.meta.ID);
        return <Route key={tab.meta.ID} path={`/${tab.meta.ID}`} element={<Start />} />;
      }
    });
    return t;
  };

  // Render the tavs in routes
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {maptabs()}
      </Route>
    </Routes>
  );
}
