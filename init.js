const { fetchList } = require("./target/fetch.js");
const { pubDateSort } = require("./target/pub-sort.js");
const { createFullResultsList } = require("./target/elements.js");

// Initializes scripts for the search
export function initSearch() {
  window.addEventListener("DOMContentLoaded", () => {
    console.log("init.js running");
    document.getElementById("submit").addEventListener("click", async () => {
      // // Get the name from the form
      // const character = document.getElementById("character-selection").value;
      // // Get universe
      // const universe = document.getElementById("universe-select").value;
      // console.log(character);

      const character = createCharacterName();

      let appearances = await fetchList(character);

      const sortType = document.getElementById("sort-type").value;
      switch (sortType) {
        case "pub-date": {
          appearances = pubDateSort(appearances);
          break;
        }
      }

      // TODO: Each search should reset the fields
      // Order the list as requested either in ascending or descending order
      if (document.getElementById("ascending").checked) {
        appearances = appearances.reverse();
      }

      // This is the HTML that will list the results
      let html = "";

      if (document.getElementById("names-only").checked) {
        // Just return the list of names and dates if names only is true
        for (const entry of appearances) {
          // TODO: I want these on opposite sides of the box and for each one to have alternative colors like grey black
          html += `<li>${entry.title} ${entry.date.month}/${entry.date.day}/${entry.date.year}</li>`;
        }
      } else {
        createFullResultsList(appearances);
      }
      // If names only is checked just return a list of names
      // Otherwise update the results as a collapsable list of:
    });
  });
}

function createCharacterName() {
  // This is not robust really I need to default to the universe they type in
  // Then trim their entry
  // them create the string
  // Get the name from the form
  const character = document.getElementById("character-selection").value.trim();

  console.log(character);
  console.log(typeof character);
  let result;

  // This does not feel robust since a character might have parentheses for other reasons but mandating it be at the end should catch most edge cases
  if (new RegExp(character).test(/\w|\s (\w)/g)) {
    result = character;
  } else {
    // Get universe and add it to the character name if the universe was not included in the string
    result =
      character + " " + document.getElementById("universe-select").value.trim();
  }

  console.log(result);

  return result;
}
