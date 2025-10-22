import { ListEntry, pubDateSort } from "./target/pub-sort.js";
import {
  createFullResultsList,
  createPartialResultsList,
} from "./target/elements.js";

// FIXME: Something is wrong here recheck tutorial

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

function handleSubmit() {
  window.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("character-search-form");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const msg = new FormData(e.target);
      const data = Object.fromEntries(msg.entries());

      window.api.form.submit(data).then(
        // Returns an object version of ListEntry[]
        (appearances) => {
          sessionStorage.setItem(
            "Appearance Data",
            JSON.stringify(appearances)
          );
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
          reflow(appearances);
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
    document.getElementById("display-style").addEventListener("change", () => {
      // Get appearance data, needs to be made into a string parsed back and reconverted into ListEntry
      const data = JSON.parse(sessionStorage.getItem("Appearance Data"));
      const appearances = data.map((element) => {
        const date = element.date;
        return new ListEntry(
          element.title,
          date.year,
          date.month,
          date.day,
          element.links
        );
      });

      reflow(appearances);
    });
  });
}

/**Recalculate the layout of the results section.*/
function reflow(appearances) {
  const display = document.getElementById("display-style");
  // TODO: Basically move all this logic serverside
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

  // Make sure it does ascendingdescending
  if (display.querySelector("#ascending").checked) {
    appearances.reverse();
  }

  // Determine how much data to show
  if (display.querySelector("#names-only").checked) {
    createPartialResultsList(appearances);
  } else {
    createFullResultsList(appearances);
  }
}
