import { ListEntry } from "../../../core/pub-sort";
import { Fragment, JSX } from "react";
import { SerializedListEntry } from "../../common/TypesAPI";
import { TabID } from "../../common/ipcAPI";
import { DisplayDensity } from "../../common/apiTypes";

interface ResultsListProps {
  ID: TabID;
  density: DisplayDensity;
  list: SerializedListEntry[];
}

export default function ResultsList({ ID, list, density }: ResultsListProps): JSX.Element {
  const Entries = () => {
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

  return (
    <Fragment>
      <label htmlFor={ID}></label>
      <div id={ID}>
        <Entries />
      </div>
    </Fragment>
  );
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
