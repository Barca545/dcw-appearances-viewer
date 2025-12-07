import { ListEntry } from "../../../core/pub-sort";
import { Fragment, JSX } from "react";
import { AppearanceData, FilterDensity, FilterOrder, TEMP_ID_WHILE_ONLY_ONE_TAB } from "../../common/apiTypes";
import { useAppSelector } from "../store/hooks";
import BooleanToggle from "./BooleanToggle";
import { InputChangeEventInput, InputChangeEventSelect } from "./types";
import LoadingSpinner from "./LoadingSpinner";

// TODO: This needs to accept the initial state as a prop so it can fill in the initial filter options and list
export default function AppResults(): JSX.Element {
  // FIXME: This will not work once more tabs are added I will actually need some way to grab by id
  // TODO: Confirm this means character only updates if the function in use app selector actually returns?
  const { character, density, list } = useAppSelector((state) => state.listState[TEMP_ID_WHILE_ONLY_ONE_TAB]);

  return (
    <Fragment>
      <FilterBar />
      {character}
      <ResultsList density={density} list={list} />
    </Fragment>
  );
}

function FilterBar(): JSX.Element {
  // Filter change handlers
  const handleOrderChange = (e: InputChangeEventSelect) => window.API.filter.order(FilterOrder.from(e.target.value).unwrap());
  const handleAscChange = (e: InputChangeEventInput) => window.API.filter.ascending(e.target.checked);
  const handleDensityChange = (e: InputChangeEventSelect) =>
    window.API.filter.density(FilterDensity.from(e.target.value).unwrap());

  return (
    <form id="filter-options">
      <select name="sort-type" defaultValue={FilterOrder.PubDate} id="sort-type" onChange={handleOrderChange}>
        <option value={FilterOrder.PubDate}>Publication Date</option>
        <option value={FilterOrder.AlphaNumeric}>A-Z</option>
      </select>
      <label htmlFor="input">Ascending</label>
      <BooleanToggle onChange={handleAscChange} />
      <label>Density</label>
      <select name="density" onChange={handleDensityChange} defaultValue={FilterDensity.Normal}>
        <option value={FilterDensity.Normal} label="Normal" />
        <option value={FilterDensity.Dense}>Names Only</option>
      </select>
    </form>
  );
}

// TODO: Why does this not render at all
function ResultsList({ list, density }: { list: AppearanceData[]; density: FilterDensity }): JSX.Element {
  const isLoading = useAppSelector((state) => state.loadState);
  if (isLoading instanceof Error) {
    return <Fragment>{isLoading.message}</Fragment>;
  } else if (isLoading == true) {
    return <LoadingSpinner />;
  }
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
          return <ResultTitle key={entry.title} entry={entry} />;
        });
      }
    }
  };

  return <Fragment>{entries()}</Fragment>;
}

function ResultTitle({ entry }: { entry: ListEntry | AppearanceData }): JSX.Element {
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
