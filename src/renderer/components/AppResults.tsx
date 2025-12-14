import { ListEntry } from "../../../core/pub-sort";
import { Fragment, JSX } from "react";
import { useAppSelector } from "../store/hooks";
import BooleanToggle from "./BooleanToggle";
import { InputChangeEventInput, InputChangeEventSelect } from "./types";
import LoadingSpinner from "./LoadingSpinner";
import { SerializedAppTab, SerializedListEntry } from "../../common/TypesAPI";
import { TabID } from "../../common/ipcAPI";
import { DisplayDensity, DisplayDirection, DisplayOrder } from "../../common/apiTypes";

// TODO: Maybe ID can come from context or something instead of being a prop
export default function AppResults({ ID }: { ID: TabID }): JSX.Element {
  // TODO: Confirm this means character only updates if the function in use app selector actually returns?
  const { meta, opts, list } = useAppSelector((state) => state.listState.record[ID] as SerializedAppTab);

  return (
    <Fragment>
      <FilterBar ID={ID} />
      {meta.characterName}
      <ResultsList density={opts.density} list={list} />
    </Fragment>
  );
}

function FilterBar({ ID }: { ID: TabID }): JSX.Element {
  // FIXME: Do these need trigger a rerender when they run?
  const { order, density, dir } = useAppSelector((state) => (state.listState.record[ID] as SerializedAppTab).opts);

  // Filter change handlers
  // None of these dispatch because the status is updated elsewhere to preserve a single source of truth
  const handleOrderChange = (e: InputChangeEventSelect) => {
    window.API.filter.order({ ID, order: DisplayOrder.from(e.target.value).unwrap() });
  };
  const handleAscChange = (e: InputChangeEventInput) => {
    window.API.filter.ascending({ ID, dir: DisplayDirection.from(e.target.checked) });
  };
  const handleDensityChange = (e: InputChangeEventSelect) => {
    window.API.filter.density({ ID, density: DisplayDensity.from(e.target.value).unwrap() });
  };

  return (
    <form id="filter-options">
      <select name="sort-type" defaultValue={order} id="sort-type" onChange={handleOrderChange}>
        <option value={DisplayOrder.PubDate}>Publication Date</option>
        <option value={DisplayOrder.AlphaNumeric}>A-Z</option>
      </select>
      <label htmlFor="input">Ascending</label>
      <BooleanToggle onChange={handleAscChange} checked={dir == DisplayDirection.Ascending ? true : false} />
      <label>Density</label>
      <select name="density" onChange={handleDensityChange} defaultValue={density}>
        <option value={DisplayDensity.Normal} label="Normal" />
        <option value={DisplayDensity.Dense}>Names Only</option>
      </select>
    </form>
  );
}

// TODO: Why does this not render at all
function ResultsList({ list, density }: { list: SerializedListEntry[]; density: DisplayDensity }): JSX.Element {
  const isLoading = useAppSelector((state) => state.loadState);
  if (isLoading instanceof Error) {
    return <Fragment>{isLoading.message}</Fragment>;
  } else if (isLoading == true) {
    return <LoadingSpinner />;
  }
  const entries = () => {
    switch (density) {
      case DisplayDensity.Normal: {
        return list.map((entry) => {
          return (
            <details key={entry.title} className="result-details">
              <summary className="result-summary">
                <ResultTitle entry={entry} />
              </summary>
              {entry.synopsis}
            </details>
          );
        });
      }
      case DisplayDensity.Dense: {
        return list.map((entry) => {
          return <ResultTitle key={entry.title} entry={entry} />;
        });
      }
    }
  };

  return <Fragment>{entries()}</Fragment>;
}

function ResultTitle({ entry }: { entry: ListEntry | SerializedListEntry }): JSX.Element {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.API.open.url(`https://dc.fandom.com/wiki/${entry.title.replaceAll(" ", "_")}`);
  };
  return (
    <div className="result-title">
      {/* FIXME: Style the span to look like an anchor */}
      <span className="result-name" onClick={handleClick}>
        {entry.title}
      </span>
      <span className="result-date">{`${entry.date.month}/${entry.date.day}/${entry.date.year}`}</span>
    </div>
  );
}
