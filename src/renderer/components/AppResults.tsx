import { ListEntry } from "../../../core/pub-sort";
import { Fragment, JSX } from "react";
import { SerializedListEntry } from "../../common/TypesAPI";
import { TabID } from "../../common/ipcAPI";
import { DisplayDensity, DisplayDirection, DisplayOptions, DisplayOrder } from "../../common/apiTypes";
import BooleanToggle from "./BooleanToggle";

interface ResultsListProps {
  ID: TabID;
  opts: DisplayOptions;
  list: SerializedListEntry[];
}

// TODO: Move the display options selector into this component.
// A change in display will always trigger a rerender

// TODO: I think the fragment wrapper is unnecessary

// TODO: Add debounce and memoization for updating the filters

export default function ResultsList({ ID, list, opts }: ResultsListProps): JSX.Element {
  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    window.API.appTab.setDisplayOptions({ ...opts, order: DisplayOrder.from(e.target.value).unwrap() });
  };
  const handleAscChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    window.API.appTab.setDisplayOptions({ ...opts, dir: DisplayDirection.from(e.target.checked) });
  };
  const handleDensityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    window.API.appTab.setDisplayOptions({ ...opts, density: DisplayDensity.from(e.target.value).unwrap() });
  };

  return (
    <Fragment>
      <form id="filter-options">
        <select name="sort-type" defaultValue={opts.order} id="sort-type" onChange={handleOrderChange}>
          <option value={DisplayOrder.PubDate}>Publication Date</option>
          <option value={DisplayOrder.AlphaNumeric}>A-Z</option>
        </select>
        <label htmlFor="input">Ascending</label>
        <BooleanToggle onChange={handleAscChange} checked={opts.dir == DisplayDirection.Ascending ? true : false} />
        <label>Density</label>
        <select name="density" onChange={handleDensityChange} defaultValue={opts.density}>
          <option value={DisplayDensity.Normal} label="Normal" />
          <option value={DisplayDensity.Dense}>Names Only</option>
        </select>
      </form>
      <label htmlFor={ID} />
      <div id={ID}>{opts.density == DisplayDensity.Normal ? <SparseEntries list={list} /> : <DenseEntries list={list} />}</div>
    </Fragment>
  );
}

function DenseEntries({ list }: { list: SerializedListEntry[] }): JSX.Element {
  return (
    <Fragment>
      {list.map((entry) => {
        return <ResultTitle key={entry.title} entry={entry} />;
      })}
    </Fragment>
  );
}

function SparseEntries({ list }: { list: SerializedListEntry[] }): JSX.Element {
  return (
    <Fragment>
      {list.map((entry) => {
        return (
          <details key={entry.title} className="result-details">
            <summary className="result-summary">
              <ResultTitle entry={entry} />
            </summary>
            {entry.synopsis}
          </details>
        );
      })}
    </Fragment>
  );
}

function ResultTitle({ entry }: { entry: ListEntry | SerializedListEntry }): JSX.Element {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.API.openURL(`https://dc.fandom.com/wiki/${entry.title.replaceAll(" ", "_")}`);
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
