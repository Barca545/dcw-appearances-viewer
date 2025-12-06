// make tabs
// - list renders sideways
// - tab is a layout
// - selected tab has a class that indicates its selected
// - bubble up to the tab bar element then stop propagation
// - Tabs should probably be <li>s and the TabBar a <ul>
// - Tabs probably need some way to convert a selection to the correct route so maybe they need to store a link

// https://stackoverflow.com/questions/42495731/should-i-use-react-router-for-a-tabs-component

// function TabsLayout() {
//   return (
//     <div>
//       <TabBar />
//       <Outlet /> {/* active tab content goes here */}
//     </div>
//   );
// }

// import { NavLink } from "react-router-dom";

// function TabBar() {
//   return (
//     <nav>
//       <NavLink to="/tab1">Tab 1</NavLink>
//       <NavLink to="/tab2">Tab 2</NavLink>
//       <NavLink to="/tab3">Tab 3</NavLink>
//     </nav>
//   );
// }

import { ReactNode, useEffect, useState } from "react";
import "./TabBar.css";
import { TabProps } from "../types";
import { NavLink } from "react-router";

function Tab({ selected, id, key: name, onSelect }: TabProps): ReactNode {
  return (
    <NavLink to={""} className={`tab${selected ? ":selected" : ""}`} onClick={onSelect}>
      {name ? name : `Untitled ${id}`}
    </NavLink>
  );
}

// Create a slice for the tabs

export function TabBar(): ReactNode {
  // TODO: Need to confirm this persists across rerenders
  const [tabs, setTabs] = useState();
  const [selectedID, setSelectedID] = useState();

  useEffect(() => {
    // Windows API listener here that updates the tabs list with new tabs whenever the user updates the list
  }, []);

  // TODO: Also need to create a "+" sign for adding new tabs
  // TODO: Need a way to get the name of a tab

  // const createTabs = [...tabs].map((tab) => {
  //   return <Tab id={tab[0]} key={tab[1]} selected={tab[0] === selectedID} onSelect={() => setSelectedID(tab)} />;
  // });

  // const handleAddTab = () => {
  //   setTabs(tabs.set(crypto.randomUUID(), ""));
  //   console.log(tabs);
  // };

  // return (
  //   <nav className="tab-bar">
  //     {tabArray}
  //     <span className="add-tab" onClick={handleAddTab}>
  //       +
  //     </span>
  //   </nav>
  // );

  throw new Error("TabBar unimplemented! Check TODO list.");
}

// - need to add a way for tabs to load from a web page or file
// - This will also allow me to reload last state when the app closes as well
