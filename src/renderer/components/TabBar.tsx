// make tabs
// - list renders sideways
// - tab is a layout
// - selected tab has a class that indicates its selected
// - bubble up to the tab bar element then stop propagation
// - Tabs should probably be <li>s and the TabBar a <ul>
// - Tabs probably need some way to convert a selection to the correct route so maybe they need to store a link

// https://stackoverflow.com/questions/42495731/should-i-use-react-router-for-a-tabs-component

import { useRef, MouseEventHandler, JSX, useState, useEffect } from "react";
import "./TabBar.css";
import { NavLink, To } from "react-router";
import { SerializedTabBarState, TabID } from "src/common/ipcAPI";
import { useAppSelector } from "../store/hooks";
import { selectBasicTabInfo } from "../store/listStateSlice";
import HorizontalScrollBar from "./ScrollBar";
import { TabMetaData } from "../../common/TypesAPI";

// TODO: Accessibility
// - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tablist_role
// - https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

type ButtonMouseEvent = React.MouseEvent<HTMLButtonElement, MouseEvent>;

interface TabProps {
  active: boolean;
  ID: TabID;
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

  return (
    <div className={["Tab", active].filter(Boolean).join(":")} onClick={onClick}>
      <NavLink className={"tab-content"} to={to} draggable={true} onClick={onClick}>
        {tabName}
      </NavLink>
      <button className={"tab-close-button"} onClick={handleClose}>
        X
      </button>
    </div>
  );
}

function isBefore(a: Node, b: Node) {
  if (a.parentNode == b.parentNode) {
    for (var cur: Node | null = a; cur && (cur = cur.previousSibling); ) {
      if (cur === b) {
        return true;
      }
    }
  }
  return false;
}

// TODO: I feel link this being async might cause problems
export default function TabBar(): Promise<JSX.Element> {
  const contentRef = useRef<HTMLDivElement>(null);
  const [tabBarState, setTabBarState] = useState<SerializedTabBarState | null>(null);
  const [draggedTab, setDraggedTab] = useState<number | null>(null);

  useEffect(() => {
    const t = window.API.tabBar.requestTabBarState();

    setTabBarState();
  }, []);

  function tabToIdx(node: Element): number {
    const parent = document.querySelector("[className]") as Element;
    return Array.from(parent.children).indexOf(node);
  }
  function tabFromIdx(idx: number): Node {
    throw new Error("childNodeFromIdx is not implemented");
  }

  const handleDragOver = async (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    // e.dataTransfer.setData("text/plain", null);

    // TODO: Use the tabid of dragged tab to get it as a node

    // For this to trigger, we know a Tab is being dragged
    if (isBefore(tabFromIdx(draggedTab as number), e.target as Node)) {
      // Convert the target node into its index. Might be useful to have helper functions for this
      const req: SerializedTabBarState = {
        selected: tabBarState.selected,
        list: tabBarState.list.splice(tabToIdx(e.target as Element), 0, tabBarState.list[draggedTab as number]),
      };
      // Updating the list returns the list's state
      setTabBarState(await window.API.tabBar.requestUpdate(req));
    } else {
      setTabBarState(await window.API.tabBar.requestUpdate(req));
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedTab(tabToIdx(e.target as Element));
  };

  return (
    <div className={"TabBar"}>
      <nav>
        {/* TODO: I think I want the LI to be a part of the list not built into the tabs */}
        <ol className="tab-bar-contents">
          {tabBarState.list.map((tab) => (
            <li style={{ all: "unset" }} key={tab.ID} draggable={true} onDragStart={handleDragStart} onDragOver={handleDragOver}>
              <Tab ID={tab.ID} tabName={tab.tabName} active={tab.ID == tabBarState.selected} to={tab.ID} />
            </li>
          ))}
          <li style={{ all: "unset" }}>
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
