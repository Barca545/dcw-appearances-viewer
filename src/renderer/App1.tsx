import { ListEntry } from "../../core/pub-sort.js";
import { createResultsList, createDenseResultsList } from "./elements.js";
import { AppearanceData, FilterDensity, FilterOptions, SortOrder } from "../common/apiTypes.js";
import { ReactNode, Fragment, FormEvent } from "react";

export default function App(): ReactNode {
  return (
    <Fragment>
      <CharacterSearchForm />
    </Fragment>
  );
}

function CharacterSearchForm(): ReactNode {
  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    const msg = new FormData(e.target as HTMLFormElement);
    const rawData = Object.fromEntries(msg.entries());
    const data = {
      character: rawData["character-selection"] as unknown as string,
      universe: rawData["universe-select"] as unknown as string,
    };

    // FIXME: There's some state stuff for other components I need to set
    // - Loading state for the results container
    // - Then when a response is returned I need to update it

    // Clear the current results to prep for new ones
    document.getElementById("results-container")?.replaceChildren(...[]);
    // Tell user a load is happening
    setLoading(true);
    window.api.form
      .submit(data)
      .then(
        (res) => displayResults(res.appearances as AppearanceData[], res.character),
        (err: string) => displayError("Search Failed", err),
      )
      .finally(() => setLoading(false));
  };

  return (
    <Fragment>
      <label htmlFor="character-selection">
        Get Appearances
        <form id="character-search-form" onSubmit={(e) => handleSubmit}>
          <input
            type="search"
            id="character-selection"
            name="character-selection"
            placeholder="Character Name"
            required
            autoFocus
          />
          <input list="earths" id="earth" name="universe-select" placeholder="(Prime Earth)" />
          <datalist id="earths">
            <option value="(Prime Earth)">Prime Earth</option>
            <option value="(New Earth)">New Earth</option>
            <option value="(Earth-One)">Earth-One</option>
            <option value="(Earth-Two)">Earth-Two</option>
          </datalist>
          <button type="submit">Submit</button>
        </form>
      </label>
    </Fragment>
  );
}

function CharacterAppearancesResults(): ReactNode {
  // when recieves an api to update, update container
  return (
    <Fragment>
      <h3 id="results-header" className="results-header">
        Appearances
      </h3>
      <FilterBar />
      <div id="result-container"></div>
    </Fragment>
  );
}

function LoadingSpinner(): ReactNode {
  // TODO: Add actual styling
  // https://www.w3schools.com/howto/howto_css_loader.asp
  return <div id="spinner">Loading...</div>;
}

function FilterBar(): ReactNode {
  const handleChange = (e: FormEvent) => {
    // // TODO: This is where the on change logic goes
    // const form = new FormData(e.currentTarget as HTMLFormElement);
    // if (form.get("sort-type")) {
    //   const sort_type = SortOrder.from(form.get("sort-type") as string).unwrap();
    //   filterOptions.setOrder(sort_type);
    // }
    // if (form.get("density")) {
    //   const density = form.get("density") as unknown as FilterDensity;
    //   filterOptions.setDensity(density);
    // }
    // // FIXME: Why am I passing in the options here when it's already sorted on server side
    // // FIXME: Instead of running display results it should create a new results list this is tricky because they're sibling elements so I might need a store?
    // window.api.requestReflow(filterOptions).then((appearances) => displayResults(appearances));
  };

  // TODO: Instead of a form just submit the components' changes individually

  return (
    <form id="filter-options" onChange={handleChange}>
      <select name="sort-type" id="sort-type">
        <option value="PUB" selected>
          Publication Date
        </option>
        <option value="A-Z">A-Z</option>
      </select>
      <label htmlFor="input">Ascending</label>
      <label className="toggle">
        <input type="checkbox" name="ascending" id="ascending" value="1" />
        <span className="slider"></span>
      </label>
      <label>Density</label>
      <select name="density" value="density">
        {/* TODO: Does this work? */}
        <option value="NORM" selected label="Normal" />
        <option value="DENSE">Names Only</option>
      </select>
    </form>
  );
}

function DenseResultsList(entries: ListEntry[]): ReactNode {
  const results = entries.map((entry) => {
    return <div className="dense-result">{ResultTitle(entry)}</div>;
  });

  return results;
}

function ResultsList(entries: ListEntry[]): ReactNode {
  const results = entries.map((entry) => {
    return (
      <details className="result-details">
        <summary className="result-summary">{ResultTitle(entry)}</summary>
        {/* <!-- TODO: rename --> */}
        <div className="result-body">
          {/* <!--Synopsis goes here--> */}
          Synopsis
        </div>
      </details>
    );
  });

  return results;
}

function ResultTitle(entry: ListEntry): ReactNode {
  // FIXME: Finish correct type
  const handleClick = (e: any) => {
    e.preventDefault();
    window.api.open.url(titleToURL(entry.title));
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

function titleToURL(title: string): string {
  return `https://dc.fandom.com/wiki/${title.replaceAll(" ", "_")}`;
}
