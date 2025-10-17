import { ListEntry, pubDateSort } from "./target/pub-sort.js";
import {
  createFullResultsList,
  createPartialResultsList,
} from "./target/elements.js";

// FIXME: Something is wrong here recheck tutorial
document
  .getElementById("toggle-dark-mode")
  .addEventListener("click", async () => {
    const isDarkMode = await window.darkMode.toggle();
  });

document
  .getElementById("reset-to-system")
  .addEventListener("click", async () => {
    await window.darkMode.system();
  });

handleSubmit();

function handleSubmit() {
  window.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("character-search-form");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(e.target);
      const msg = Object.fromEntries(data.entries());

      window.form.submit(msg).then(
        // TODO: All this logic should actually be in a helper function because it will need to be replicated for when the display is changed
        (appearances) => {
          // FIXME: Annoyingly sending it makes it into a json so I need to reconvert it to a list of ListEntrys
          appearances = appearances.map((element) => {
            const date = element.date;
            return new ListEntry(
              element.title,
              date.year,
              date.month,
              date.day,
              element.links
            );
          });
          // TODO: AAAALLLLL of this can be shifted into a helper function and also called on change
          // This is where stuff like checking for display order and ascending/descending should happen
          const display = document.getElementById("display-style");

          switch (display.querySelector("#sort-type").value) {
            case "pub-date": {
              appearances = pubDateSort(appearances);
              break;
            }
            case "A-Z": {
              // TODO: This type of sorting needs to be checked for correctness
              appearances = appearances.sort((a, b) => {
                if (a.title < b.title) {
                  return -1;
                }
                if (a.title > b.title) {
                  return 1;
                }
                return 0;
              });
              break;
            }
          }
          // Determine how much data to show
          if (display.querySelector("#names-only").checked) {
            createPartialResultsList(appearances);
          } else {
            createFullResultsList(appearances);
          }
        },
        () => {
          // TODO: Create a dialog saying lookup failed
        }
      );
    });
  });
}

function handleFilter() {
  window.addEventListener("DOMContentLoaded", async () => {
    document.addEventListener("onchange", () => {
      // This means I need to store the appearance data somewhere
    });
  });
}

function reflow(appearances) {
  // Store data, needs to be made into a string parsed back and reconverted into ListEntry
  sessionStorage.setItem();

  const display = document.getElementById("display-style");

  switch (display.querySelector("#sort-type").value) {
    case "pub-date": {
      appearances = pubDateSort(appearances);
      break;
    }
    case "A-Z": {
      // TODO: This type of sorting needs to be checked for correctness
      appearances = appearances.sort((a, b) => {
        if (a.title < b.title) {
          return -1;
        }
        if (a.title > b.title) {
          return 1;
        }
        return 0;
      });
      break;
    }
  }
  // Determine how much data to show
  if (display.querySelector("#names-only").checked) {
    createPartialResultsList(appearances);
  } else {
    createFullResultsList(appearances);
  }
}
