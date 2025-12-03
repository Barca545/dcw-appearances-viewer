import { ListEntry } from "../../core/pub-sort.js";
import { createResultsList, createDenseResultsList } from "./elements.js";
import { AppearanceData, FilterOptions, SortOrder } from "../common/apiTypes.js";

// TODO: Have a loading symbol that starts once submit happens and stops when new data is recieved

// FIXME: Having this variable in two places risks getting out of sync
// Once the clientside stuff is updated, I am skeptical it needs to be retained
let filterOptions = new FilterOptions();

// FIXME: Probalby unnessecary since the script being at the bottom of the dom means it always loads last
window.addEventListener("DOMContentLoaded", async () => {
  handleSubmit();
  handleFilter();
});

function handleSubmit() {
  const form = document.getElementById("character-search-form") as HTMLFormElement;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const msg = new FormData(e.target as HTMLFormElement);
    const rawData = Object.fromEntries(msg.entries());
    const data = {
      character: rawData["character-selection"] as unknown as string,
      universe: rawData["universe-select"] as unknown as string,
    };

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
  });
}

function handleFilter() {
  console.log(document.getElementById("filter-options"));
  document.getElementById("filter-options")?.addEventListener("change", (e) => {
    // FIXME: This needs to be updated so what it does is send the button press to main
    // main will handle it
    const form = new FormData(e.currentTarget as HTMLFormElement);

    filterOptions = new FilterOptions().setAscending(form.get("ascending") as unknown as boolean);

    if (form.get("sort-type")) {
      const sort_type = SortOrder.from(form.get("sort-type") as string).unwrap();
      filterOptions.setOrder(sort_type);
    }

    if (form.get("density")) {
      const density = form.get("density") as unknown as "DENSE" | "NORM";
      filterOptions.setDensity(density);
    }

    // FIXME: Why am I passing in the options here when it's already sorted on server side
    window.api.requestReflow(filterOptions).then((appearances) => displayResults(appearances));
  });
}

// TODO: Why is this an export?
export function displayResults(data: AppearanceData[], character?: string, opt?: FilterOptions) {
  // FIXME: Annoyingly sending it makes it into a json so I need to reconvert it to a list of ListEntrys
  const appearances = data.map((element) => {
    const date = element.date;
    return new ListEntry(element.title, element.synopsis, date.year, date.month, date.day, element.link);
  });

  // FIXME: I don't like this logic being in the renderer I could stick this in an execute javascript in the main process but unfortunatelu the filter options would not be open to it
  // Determine how much data to show
  if (opt) {
    filterOptions = opt;
  }

  switch (filterOptions.density) {
    case "NORM": {
      createResultsList(appearances);
      break;
    }
    case "DENSE": {
      createDenseResultsList(appearances);
      break;
    }
  }

  if (character) {
    const header = document.getElementById("results-header") as HTMLElement;
    header.textContent = `${character} Appearances`;
  }
}

function displayError(title: string, error: string) {
  window.api.displayError(title, error);
}

// This sets up a callback so the page renders new data when it recieves it
window.api.recieveData((res) => displayResults(res.data, undefined, res.opt));

/** Set the loading state of the document and control how the loading */
function setLoading(state: boolean) {
  let spinner = document.getElementById("spinner") as HTMLElement;
  spinner.style.display = state ? "block" : "none";
  let results = document.getElementById("results-container") as HTMLElement;
  results.style.visibility = !state ? "visible" : "hidden";
}
