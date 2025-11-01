import { ListEntry } from "../../core/pub-sort.js";
import { createResultsList, createDenseResultsList } from "./elements.js";
import { AppearanceData, FilterOptions } from "../common/apiTypes.js";

// FIXME: Having this variable in two places risks getting out of sync
// Once the clientside stuff is updated, I am skeptical it needs to be retained
let filterOptions = new FilterOptions();

handleSubmit();
handleFilter();

function handleSubmit() {
  window.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("character-search-form") as HTMLFormElement;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const msg = new FormData(e.target as HTMLFormElement);
      const rawData = Object.fromEntries(msg.entries());
      const data = {
        "character-selection": rawData["character-selection"] as unknown as string,
        "universe-select": rawData["universe-select"] as unknown as string,
      };

      window.api.form.submit(data).then(
        // Returns an object version of ListEntry[]
        ({ appearances, character }) => {
          displayElements(appearances, character);
        },
        () => {
          // TODO: Create a dialog saying lookup failed if an error is returned
        },
      );
    });
  });
}

function handleFilter() {
  window.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("display-style")?.addEventListener("change", (e) => {
      // FIXME: This needs to be updated so what it does is send the button press to main
      // main will handle it
      const form = new FormData(e.currentTarget as HTMLFormElement);

      filterOptions = new FilterOptions().setAscending(form.get("ascending") as unknown as boolean);

      if (form.get("sort-type")) {
        const sort_type = form.get("sort-type") as unknown as "PUB" | "A-Z";
        filterOptions.setOrder(sort_type);
      }

      if (form.get("density")) {
        const density = form.get("density") as unknown as "DENSE" | "NORM";
        filterOptions.setDensity(density);
      }

      // FIXME: Why am I passing in the options here when it's already sorted on server side
      window.api.filterOptions(filterOptions).then((appearances) => displayElements(appearances));
    });
  });
}

export function displayElements(data: AppearanceData[], character?: string, opt?: FilterOptions) {
  // FIXME: Annoyingly sending it makes it into a json so I need to reconvert it to a list of ListEntrys
  const appearances = data.map((element) => {
    const date = element.date;
    return new ListEntry(element.title, date.year, date.month, date.day, element.link);
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

// This sets up a callback so the page renders new data when it recieves it
window.api.recieveData((res) => displayElements(res.opt, res.data));
