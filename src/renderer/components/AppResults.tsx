import { ListEntry } from "../../../core/pub-sort";
import { Fragment, JSX, useEffect } from "react";
import { SerializedAppTab, SerializedListEntry } from "../../common/TypesAPI";
import { TabID } from "../../common/ipcAPI";
import { DisplayDensity } from "../../common/apiTypes";
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
        <label htmlFor={`${ID}-result-list`} />
        <SparseEntries list={data.list} id={`${ID}-result-list`} />
      </Fragment>
    );
  } else {
    return (
      <Fragment>
        <label htmlFor={`${ID}-result-list`} />
        <DenseEntries list={data.list} id={`${ID}-result-list`} />
      </Fragment>
    );
  }
}

function DenseEntries({ list, id }: { list: SerializedListEntry[]; id?: string }): JSX.Element {
  return (
    <div id={id}>
      {list.map((entry) => {
        return <ResultTitle key={entry.title} entry={entry} />;
      })}
    </div>
  );
}

function SparseEntries({ list, id }: { list: SerializedListEntry[]; id?: string }): JSX.Element {
  return (
    <div id={id}>
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
    </div>
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
