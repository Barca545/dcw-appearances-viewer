// make tabs
// - list renders sideways
// - tab is a layout
// - selected tab has a class that indicates its selected
// - bubble up to the tab bar element then stop propagation
// - Tabs should probably be <li>s and the TabBar a <ul>
// - Tabs probably need some way to convert a selection to the correct route so maybe they need to store a link

// https://stackoverflow.com/questions/42495731/should-i-use-react-router-for-a-tabs-component

import { JSX } from "react";
import "./TabBar.css";
import { NavLink, useNavigate } from "react-router";
import { SerializedTabID } from "src/common/ipcAPI";
import { useAppSelector } from "../store/hooks";
import { selectBasicTabInfo } from "../store/listStateSlice";

interface TabProps {
  selected: boolean;
  ID: SerializedTabID;
  tabName: string;
  onSelect: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

// TODO: I think there is another way to do the selecting

function Tab({ selected, ID, tabName, onSelect }: TabProps): JSX.Element {
  // FIXME: I think this is routing me to the wrong place
  return (
    <li className={`Tab${selected ? " selected" : ""}`} onClick={onSelect} draggable={true}>
      <NavLink to={ID} className={"nav-link"}>
        {tabName}
      </NavLink>
    </li>
  );
}

function AddTab(): JSX.Element {
  return (
    <li className="AddTab Tab" onClick={() => window.API.open.tab()}>
      +
    </li>
  );
}

// Create a slice for the tabs

export function TabBar(): JSX.Element {
  const navigate = useNavigate();
  // TODO: Need to confirm this persists across rerenders
  // TODO:Need to grab the id of the first tab

  const tabs = useAppSelector(selectBasicTabInfo);
  const selected = useAppSelector((state) => state.listState.selected);

  const handleTabClick = (ID: SerializedTabID) => {
    navigate(ID);
    window.API.tab.setCurrent(ID);
  };

  return (
    <nav>
      <ul className={"TabBar"}>
        {[...tabs].map((tab) => (
          <Tab
            ID={tab.ID}
            key={tab.ID}
            tabName={tab.tabName}
            selected={tab.ID == selected}
            onSelect={() => handleTabClick(tab.ID)}
          />
        ))}
        <AddTab />
      </ul>
    </nav>
  );
}

// - need to add a way for tabs to load from a web page or file
// - This will also allow me to reload last state when the app closes as well
