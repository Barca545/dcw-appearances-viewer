import { useRef, MouseEventHandler, JSX, useState, useEffect, DragEventHandler } from "react";
import "./TabBar.css";
import { useNavigate } from "react-router";
import { SerializedTabBarState, TabID } from "src/common/ipcAPI";
import HorizontalScrollBar from "./ScrollBar";
import { ButtonMouseEvent } from "./types";
import { isSerializedDataTab } from "../../common/TypesAPI";

// https://stackoverflow.com/questions/42495731/should-i-use-react-router-for-a-tabs-component

// TODO: Accessibility
// - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tablist_role
// - https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

interface TabProps {
  selected: boolean;
  isClean: boolean;
  ID: TabID;
  tabName: string;
  // to: To;
  onClick: MouseEventHandler;
  onClose?: MouseEventHandler;
  onDragStart?: DragEventHandler;
  onDragEnter?: DragEventHandler;
  onDragLeave?: DragEventHandler;
  onDrop?: DragEventHandler;
  onDragEnd?: DragEventHandler;
  onMouseEnter?: MouseEventHandler;
  onMouseLeave?: MouseEventHandler;
}

function Tab({
  ID,
  selected,
  isClean,
  tabName,
  onClick,
  onClose,
  onDragStart,
  onDragEnter,
  onDragLeave,
  onDragEnd,
  onDrop,
  onMouseEnter,
  onMouseLeave,
}: TabProps): JSX.Element {
  const handleClose = (e: ButtonMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClose) {
      onClose(e);
    }
  };

  return (
    <li
      className={["Tab", selected && "selected"].filter(Boolean).join(" ")}
      onClick={onClick}
      draggable={true}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDragStart={onDragStart}
      onDragOver={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      id={ID}
    >
      <span className={"tab-content"}>{tabName}</span>
      <span className="unsaved-indicator" style={{ visibility: isClean ? "hidden" : "visible" }} />
      <button className={"tab-button close"} onClick={handleClose}>
        <b>✕</b>
      </button>
    </li>
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
  const navigate = useNavigate();

  const updateHandler = (state: SerializedTabBarState) => {
    setTabBarState(state);
    navigate(state.selected.URL);
  };

  useEffect(() => {
    // Fetch the data
    window.API.tabBar.request().then(updateHandler);

    // Register a listener
    return window.API.tabBar.onUpdate(updateHandler);
  }, []);

  useEffect(() => {
    if (tabBarState) {
      navigate(tabBarState.selected.URL);

      const selectedTab = document.getElementById(tabBarState.selected.ID);
      if (selectedTab) {
        selectedTab.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [tabBarState?.selected.ID]);

  function tabToIdx(node: Element): number {
    const parent = document.querySelector(`[class="tab-list"]`) as Element;
    return Array.from(parent.children).indexOf(node);
  }

  // Drag and drop stuff taken from here: https://stackoverflow.com/a/79136750/24660323 and https://stackoverflow.com/a/79136750/24660323
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedTabIdx(tabToIdx(e.currentTarget as Element));

    // Create a clone for the drag image
    const dragElement = e.currentTarget as HTMLElement;
    e.dataTransfer.setDragImage(dragElement, dragElement.offsetWidth / 2, dragElement.offsetHeight / 2);
  };

  const onDragEnter = (e: React.DragEvent) => {
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

      // TODO: VSC just always drops it to the left. Is that more intuitive?
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

      setTabBarState(await window.API.tabBar.reorderTabs(req));
    }
  };

  const handleDragEnd = () => {
    // Gotta clean up any lingering "over" classes
    const parent = document.querySelector(`[class="tab-list"]`) as Element;
    [...parent.children].forEach((child) => child.classList.remove("over"));
    setDraggedTabIdx(null);
  };

  // These are for controlling hover behavior
  const handleMouseEnter = (e: React.MouseEvent) => {
    e.currentTarget.classList.add("hovered");
  };
  const handleMouseLeave = (e: React.MouseEvent) => {
    e.currentTarget.classList.remove("hovered");
  };

  // TODO: Possibly move inside tab component
  const handleChangeTab = (ID: TabID) => window.API.tabBar.navigateToTab(ID).then((state) => setTabBarState(state));

  const handleAddTab = () => window.API.tabBar.openAndNavigateToTab().then((state) => setTabBarState(state));

  const handleClose = (ID: TabID) => window.API.tabBar.closeTab(ID).then((state) => setTabBarState(state));

  return (
    <div className={"TabBar"}>
      <nav>
        {/* TODO: I think I want the LI to be a part of the list not built into the tabs */}
        <ol className="tab-list">
          {tabBarState?.list.map((tab) => {
            return (
              <Tab
                key={tab.meta.ID}
                ID={tab.meta.ID}
                isClean={isSerializedDataTab(tab) ? tab.isClean : true}
                onDragStart={handleDragStart}
                onDragEnter={onDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                tabName={tab.meta.tabName}
                selected={tab.meta.ID == tabBarState.selected.ID}
                onClick={(e) => {
                  // Not great but for now just doing this, it handles dragging and deselecting a hovered
                  e.currentTarget.classList.remove("hovered");
                  handleChangeTab(tab.meta.ID);
                }}
                onClose={() => handleClose(tab.meta.ID)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}
        </ol>
      </nav>
      <span className="AddTab Tab">
        <button onClick={handleAddTab} className="tab-button">
          <span
            style={{
              fontSize: " 1.8rem",
              fontWeight: "300",
              lineHeight: 1,
            }}
          >
            +
          </span>
        </button>
      </span>
      <HorizontalScrollBar contentRef={contentRef} />
    </div>
  );
}
