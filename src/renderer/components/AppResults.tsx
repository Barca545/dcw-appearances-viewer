import { ListEntry } from "../../../core/pub-sort";
import { Fragment, ReactNode } from "react";
import { AppearanceData, FilterDensity, SortOrder } from "../../common/apiTypes";
import { useAppSelector } from "../store/hooks";

// TODO: It might be better to render the ResultsList component in the main process.
// That way no state is stored clientside and desyncing stops being a concern

type InputChangeEvent = React.ChangeEvent<HTMLSelectElement | HTMLInputElement>;

// TODO: This probably belongs in a utils file
function parseBool(string: string): boolean {
  return string.toLowerCase() === "true";
}

export default function AppResults(): ReactNode {
  const { character } = useAppSelector((state) => state.listState);
  return (
    <Fragment>
      <FilterBar />
      {character}
      <ResultsList />
    </Fragment>
  );
}

function FilterBar(): ReactNode {
  // Filter change handlers
  const handleOrderChange = (e: InputChangeEvent) => window.api.filter.order(SortOrder.from(e.target.value).unwrap());
  const handleAscChange = (e: InputChangeEvent) => window.api.filter.ascending(parseBool(e.target.value));
  const handleDensityChange = (e: InputChangeEvent) => window.api.filter.density(FilterDensity.from(e.target.value).unwrap());

  return (
    <form id="filter-options">
      <select name="sort-type" defaultValue={SortOrder.PubDate} id="sort-type" onChange={handleOrderChange}>
        <option value={SortOrder.PubDate}>Publication Date</option>
        <option value={SortOrder.AlphaNumeric}>A-Z</option>
      </select>
      <label htmlFor="input">Ascending</label>
      <label className="toggle">
        <input type="checkbox" name="ascending" id="ascending" value="1" onChange={handleAscChange} />
        <span className="slider"></span>
      </label>
      <label>Density</label>
      <select name="density" onChange={handleDensityChange} defaultValue={FilterDensity.Normal}>
        <option value={FilterDensity.Normal} label="Normal" />
        <option value={FilterDensity.Dense}>Names Only</option>
      </select>
    </form>
  );
}

// TODO: Merge Dense/Normal results list functions into this one component?
// TODO: Why does this render twice
function ResultsList(): ReactNode {
  const { list, density } = useAppSelector((state) => state.listState);
  console.log("Rendering ResultsList", list.length, density);
  // TODO: Wrap internally with a <div id="results-container"/>?
  const entries = () => {
    switch (density) {
      case FilterDensity.Normal: {
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
      case FilterDensity.Dense: {
        return list.map((entry) => {
          return (
            <div className="dense-result">
              <ResultTitle entry={entry} />
            </div>
          );
        });
      }
    }
  };

  return <Fragment>{entries()}</Fragment>;
}

function ResultTitle({ entry }: { entry: ListEntry | AppearanceData }): ReactNode {
  // FIXME: Find correct type
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.api.open.url(`https://dc.fandom.com/wiki/${entry.title.replaceAll(" ", "_")}`);
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
