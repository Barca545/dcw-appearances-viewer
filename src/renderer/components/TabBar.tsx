import { useRef, MouseEventHandler, JSX, useState, useEffect } from "react";
import "./TabBar.css";
import { NavLink, To } from "react-router";
import { SerializedTabBarState, TabID } from "src/common/ipcAPI";
import HorizontalScrollBar from "./ScrollBar";
import { ButtonMouseEvent } from "./types";

// https://stackoverflow.com/questions/42495731/should-i-use-react-router-for-a-tabs-component

// TODO: Accessibility
// - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tablist_role
// - https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

interface TabProps {
  selected: boolean;
  ID: TabID;
  tabName: string;
  to: To;
  onClick?: MouseEventHandler;
  onClose?: MouseEventHandler;
}

// TODO: I think there is another way to do the selecting

function Tab({ selected, tabName, to, onClick, onClose }: TabProps): JSX.Element {
  // TODO: onClick needs to go down to the navlink but also not disrupt it
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
    <div className={["Tab", selected && "selected"].filter(Boolean).join(" ")} onClick={onClick}>
      <NavLink className={"tab-content"} to={to} onClick={onClick}>
        {tabName}
      </NavLink>
      <button className={"tab-close-button"} onClick={handleClose}>
        X
      </button>
    </div>
  );
}

/** Returns `true` if the cursor is past the `Element`'s horizontal halfway point.
 * The halfway point is always relative to the `Element`'s bounding rectangle's left side. */
function isPastHalfway(e: React.DragEvent): boolean {
  const rect = (e.currentTarget as Element).getBoundingClientRect();
  const mouseX = e.clientX;
  const middle = rect.left + rect.width / 2;
  return mouseX > middle;
}

// TODO: I feel link this being async might cause problems
export default function TabBar(): JSX.Element {
  const contentRef = useRef<HTMLDivElement>(null);
  const [tabBarState, setTabBarState] = useState<SerializedTabBarState | null>(null);
  const [draggedTabIdx, setDraggedTabIdx] = useState<number | null>(null);

  useEffect(() => {
    // Fetch the data
    window.API.tabBar.requestTabBarState().then((state) => setTabBarState(state));

    // Register a listener
    window.API.tabBar.update((state) => {
      console.log(state);
      setTabBarState(state);
    });
  }, []);

  function tabToIdx(node: Element): number {
    const parent = document.querySelector(`[class]="TabBar"`) as Element;
    return Array.from(parent.children).indexOf(node);
  }

  // Drag and drop stuff taken from here: https://stackoverflow.com/a/79136750/24660323 and https://stackoverflow.com/a/79136750/24660323
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedTabIdx(tabToIdx(e.currentTarget as Element));
    // e.dataTransfer.setData("text/html", (e.currentTarget as Element).innerHTML);
    // TODO: Need to also update the selected tab
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.effectAllowed = "move";
    // TODO: Need to define this class
    (e.currentTarget as Element).classList.add("over");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    (e.currentTarget as Element).classList.remove("over");
  };

  const handleDrop = async (e: React.DragEvent) => {
    // If the cursor is over the tab's horizontal halfway point, I want to shift the tab being dropped into to the right
    // If the cursor is over the tab's horizontal halfway point, I want to shift the tab being dropped into to the left

    if (tabBarState) {
      const targetIdx = tabToIdx(e.currentTarget as Element);

      if (targetIdx === -1 || targetIdx === draggedTabIdx) {
        return; // Invalid drop or dropped on itself
      }

      let insertIdx;
      if (isPastHalfway(e)) {
        // TODO: Drop dragged tab to the right of the target tab
        insertIdx = targetIdx + 1;
      } else {
        // TODO: Drop dragged tab to the left of the target tab
        insertIdx = targetIdx;
      }

      // If the dragged tab is before the insert index, removing it in the splice step will decrement the target index by 1 so we need to account for that
      if ((draggedTabIdx as number) < insertIdx) {
        insertIdx--;
      }

      const newList = [...tabBarState.list];

      // IMPORTANT: `splice` modifies in place
      // Remove the item from its original position
      const [draggedTab] = newList.splice(draggedTabIdx as number, 1);
      newList.splice(insertIdx, 0, draggedTab);

      const req: SerializedTabBarState = {
        selected: tabBarState.selected,
        list: newList,
      };

      setTabBarState(await window.API.tabBar.requestUpdate(req));
    }
  };

  const handleDragEnd = () => setDraggedTabIdx(null);

  return (
    <div className={"TabBar"}>
      <nav>
        {/* TODO: I think I want the LI to be a part of the list not built into the tabs */}
        <ol className="tab-bar-contents">
          {tabBarState?.list.map((tab) => (
            <li
              style={{ all: "unset" }}
              key={tab.meta.ID}
              draggable={true}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            >
              <Tab
                ID={tab.meta.ID}
                tabName={tab.meta.tabName}
                selected={tab.meta.ID == tabBarState.selected}
                to={tab.meta.ID}
                onClick={() => window.API.tab.setCurrent(tab.meta.ID)}
              />
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
