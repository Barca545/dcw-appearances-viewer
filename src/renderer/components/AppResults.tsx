import { ListEntry } from "../../../core/pub-sort";
import { Fragment, JSX, useEffect } from "react";
import { SerializedAppTab, SerializedListEntry } from "../../common/TypesAPI";
import { TabID } from "../../common/ipcAPI";
import { DisplayDensity } from "../../main/displayOptions";
import LoadingSpinner from "./LoadingSpinner";

interface ResultsListProps {
  ID: TabID;
  data: SerializedAppTab;
  isLoading: boolean;
}

// TODO: Move the display options selector into this component.
// A change in display will always trigger a rerender

// TODO: I think the fragment wrapper is unnecessary

// TODO: Add debounce and memoization for updating the filters

export default function ResultsList({ ID, data, isLoading }: ResultsListProps): JSX.Element {
  useEffect(() => {}, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (data.opts.density == DisplayDensity.Normal) {
    return (
      <Fragment>
        <label htmlFor={`${ID}-result-list`}>
          <h2>{`${data.meta.characterName} Appearances`}</h2>
        </label>
        <SparseEntries list={data.list} id={`${ID}-result-list`} data={data} />
      </Fragment>
    );
  } else {
    return (
      <Fragment>
        <label htmlFor={`${ID}-result-list`}>
          <h2>{`${data.meta.characterName} Appearances`}</h2>
        </label>
        <DenseEntries list={data.list} id={`${ID}-result-list`} data={data} />
      </Fragment>
    );
  }
}

function DenseEntries({ list, id, data }: { list: SerializedListEntry[]; id?: string; data: SerializedAppTab }): JSX.Element {
  return (
    <div id={id}>
      {list.map((entry) => {
        return <ResultTitle key={entry.title} entry={entry} data={data} />;
      })}
    </div>
  );
}

function SparseEntries({ list, id, data }: { list: SerializedListEntry[]; id?: string; data: SerializedAppTab }): JSX.Element {
  return (
    <div id={id}>
      {list.map((entry) => {
        return (
          <details key={entry.title} className="result-details">
            <summary className="result-summary">
              <ResultTitle entry={entry} data={data} />
            </summary>
            {entry.synopsis}
          </details>
        );
      })}
    </div>
  );
}

function ResultTitle({ entry, data }: { entry: ListEntry | SerializedListEntry; data: SerializedAppTab }): JSX.Element {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("visited");
    // TODO: The URL should be built into the list entry so it's entry.URL
    window.API.openURL(entry.URL);
  };

  const resultsCSS: React.CSSProperties = { display: "flex" };

  if (data.opts.showDates) {
    // TODO: Ideally there would be a small space between the names and the dates
    // | title |<space>| date
    return (
      <div className="result-title" style={resultsCSS}>
        <span className="result-name pseudo-link" onClick={handleClick}>
          {entry.title}
        </span>
        <span className="result-date">{`${entry.date.month}/${entry.date.day}/${entry.date.year}`}</span>
      </div>
    );
  } else {
    // TODO: Ideally there would be a small space between the names and the dates
    // | title |<space>| date
    return (
      <div className="result-title" style={resultsCSS}>
        <span className="result-name pseudo-link" onClick={handleClick}>
          {entry.title}
        </span>
      </div>
    );
  }
}
