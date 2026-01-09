import { IssueData } from "../../../core/issue_data";
import { Fragment, JSX, useEffect } from "react";
import { SerializedAppTab } from "../../common/TypesAPI";
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

function DenseEntries({ list, id, data }: { list: IssueData[]; id?: string; data: SerializedAppTab }): JSX.Element {
  return (
    <div id={id}>
      {list.map((entry) => {
        return <ResultTitle key={entry.title} entry={entry} data={data} />;
      })}
    </div>
  );
}

function SparseEntries({ list, id, data }: { list: IssueData[]; id?: string; data: SerializedAppTab }): JSX.Element {
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

function ResultTitle({ entry: issue, data }: { entry: IssueData; data: SerializedAppTab }): JSX.Element {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("visited");
    window.API.openURL(issue.URL);
  };

  const resultsCSS: React.CSSProperties = { display: "flex" };

  if (data.opts.showDates) {
    return (
      <div className="result-title" style={resultsCSS}>
        <span className="result-name pseudo-link" onClick={handleClick}>
          {issue.title}
        </span>
        <span className="result-date">{`${issue.date.month}/${issue.date.day}/${issue.date.year}`}</span>
      </div>
    );
  } else {
    return (
      <div className="result-title" style={resultsCSS}>
        <span className="result-name pseudo-link" onClick={handleClick}>
          {issue.title}
        </span>
      </div>
    );
  }
}
