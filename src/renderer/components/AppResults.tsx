import { ListEntry } from "../../../core/pub-sort";
import { createContext, Fragment, ReactNode, useContext, useEffect, useState } from "react";
import { FilterDensity, SortOrder } from "../../common/apiTypes";

// TODO: It might be better to render the ResultsList component in the main process.
// That way no state is stored clientside and desyncing stops being a concern

type InputChangeEvent = React.ChangeEvent<HTMLSelectElement | HTMLInputElement>;

// TODO: This probably belongs in a utils file
function parseBool(string: string): boolean {
  return string.toLowerCase() === "true";
}

// TODO: Move these providers to the top level of the app so they can be set from the search bar?
const defaultList = [] as ListEntry[];
const defaultDensity = FilterDensity.Normal;

const ListContext = createContext(defaultList);
const DensityContext = createContext(defaultDensity);

export default function AppResults(): ReactNode {
  // Not sure how I want to do this with useEffect since it needs a listener
  const [list, setList] = useState(defaultList);
  const [density, setDensity] = useState(defaultDensity);

  useEffect(() => {
    window.api.reflow((data, dense) => {
      const list = data.map((element) => {
        const date = element.date;
        return new ListEntry(element.title, element.synopsis, date.year, date.month, date.day, element.link);
      });
      setList(list);
      setDensity(dense);
    });
    return () => {};
  }, []);

  return (
    <Fragment>
      <FilterBar />
      <ListContext value={list}>
        <DensityContext value={density}>
          <ResultsList />
        </DensityContext>
      </ListContext>
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
function ResultsList(): ReactNode {
  const list = useContext(ListContext);
  const density = useContext(DensityContext);
  // TODO: Wrap internally with a <div id="results-container"/>?
  switch (density) {
    case FilterDensity.Normal: {
      return list.map((entry) => {
        return (
          <details className="result-details">
            <summary className="result-summary">{ResultTitle(entry)}</summary>
            {entry.synopsis}
          </details>
        );
      });
    }
    case FilterDensity.Dense: {
      return list.map((entry) => {
        return <div className="dense-result">{ResultTitle(entry)}</div>;
      });
    }
  }
}

function ResultTitle(entry: ListEntry): ReactNode {
  // FIXME: Find correct type
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.api.open.url(`https://dc.fandom.com/wiki/${entry.title.replaceAll(" ", "_")}`);
  };
  return (
    <div className="result-title">
      {/* FIXME: Style the span to look like an anchors */}
      <span className="result-name" onClick={handleClick}>
        {entry.title}
      </span>
      <span className="result-date">{`${entry.date.month}/${entry.date.day}/${entry.date.year}`}</span>
    </div>
  );
}
