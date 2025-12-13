// make tabs
// - list renders sideways
// - tab is a layout
// - selected tab has a class that indicates its selected
// - bubble up to the tab bar element then stop propagation
// - Tabs should probably be <li>s and the TabBar a <ul>
// - Tabs probably need some way to convert a selection to the correct route so maybe they need to store a link

// https://stackoverflow.com/questions/42495731/should-i-use-react-router-for-a-tabs-component

import { useRef, MouseEventHandler, JSX } from "react";
import "./TabBar.css";
import { NavLink, To } from "react-router";
import { SerializedTabID } from "src/common/ipcAPI";
import { useAppSelector } from "../store/hooks";
import { selectBasicTabInfo } from "../store/listStateSlice";
import HorizontalScrollBar from "./ScrollBar";

// TODO: Accessibility
// - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tablist_role
// - https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

type ButtonMouseEvent = React.MouseEvent<HTMLButtonElement, MouseEvent>;

interface TabProps {
  active: boolean;
  ID: SerializedTabID;
  tabName: string;
  to: To;
  onClick?: MouseEventHandler;
  onClose?: MouseEventHandler;
}

// TODO: I think there is another way to do the selecting

function Tab({ active, tabName, to, onClick, onClose }: TabProps): JSX.Element {
  // TODO: onClick needs to go down to the navlink
  // TODO: NavLink style change needs to bubble up to the Tab
  // TODO: Dragable does not seem to get inherited

  const handleClose = (e: ButtonMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClose) {
      onClose(e);
    }
  };

  console.log(active);

  return (
    <li className={["Tab", active].filter(Boolean).join(":")} draggable={true} onClick={onClick}>
      <NavLink className={"tab-content"} to={to} draggable={true} onClick={onClick}>
        {tabName}
      </NavLink>
      <button className={"tab-close-button"} onClick={handleClose}>
        X
      </button>
    </li>
  );
}

export default function TabBar(): JSX.Element {
  // FIXME: Should query the main process directly instead of using a store
  const tabs = useAppSelector(selectBasicTabInfo);
  const selected = useAppSelector((state) => state.listState.selected);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className={"TabBar"}>
      <nav>
        <ol className="tab-bar-contents">
          {[...tabs].map((tab) => (
            <Tab ID={tab.ID} key={tab.ID} tabName={tab.tabName} active={tab.ID == selected} to={tab.ID} />
          ))}
          <li>
            <button className="AddTab" onClick={() => window.API.open.tab()}>
              +
            </button>
          </li>
        </ol>
      </nav>
      <HorizontalScrollBar contentRef={contentRef} />
    </div>
  );
}
