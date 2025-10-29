import { ListEntry } from "./target/pub-sort.js";
import {
  createResultsList,
  createDenseResultsList,
} from "./target/elements.js";
import { FilterOptions } from "./target/types.js";

// FIXME: Having this variable in two places risks getting out of sync
// FIXME: Convert to TS
let filterOptions = new FilterOptions();

function navigate() {
  window.addEventListener("DOMContentLoaded", async () => {
    Array.from(document.getElementsByClassName("nav-button")).forEach(
      (button) => {
        button.addEventListener("click", (e) => {
          // No need to prevent default on e since type button don't default to submit
          window.api.navigate.toPage(`${e.target.value}.html`);
        });
      }
    );
  });
}

handleSubmit();
handleFilter();
navigate();
// openResultLink();

function handleSubmit() {
  window.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("character-search-form");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const msg = new FormData(e.target);
      const data = Object.fromEntries(msg.entries());

      window.api.form.submit(data).then(
        // Returns an object version of ListEntry[]
        ({ appearances, character }) => {
          displayElements(undefined, appearances, character);
        },
        () => {
          // TODO: Create a dialog saying lookup failed if an error is returned
        }
      );
    });
  });
}

function handleFilter() {
  window.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("display-style").addEventListener("change", (e) => {
      // FIXME: This needs to be updated so what it does is send the button press to main
      // main will handle it
      const form = new FormData(e.currentTarget);

      filterOptions = new FilterOptions()
        // FIXME: The toggle is being weird about sending its result
        .setDensity(form.get("density"))
        .setOrder(form.get("sort-type") ?? false)
        .setAscending(form.get("ascending"));

      window.api
        .filterOptions(filterOptions)
        .then((appearances) => displayElements(filterOptions, appearances));
    });
  });
}

export function displayElements(opt, elements, charName) {
  // FIXME: Annoyingly sending it makes it into a json so I need to reconvert it to a list of ListEntrys
  const appearances = elements.map((element) => {
    const date = element.date;
    return new ListEntry(
      element.title,
      date.year,
      date.month,
      date.day,
      element.links
    );
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

  if (charName) {
    document.getElementById(
      "results-header"
    ).textContent = `${charName} Appearances`;
  }
}

// This sets up a callback so the page renders new data when it recieves it
window.api.recieveData((res) => displayElements(res.opt, res.data));
