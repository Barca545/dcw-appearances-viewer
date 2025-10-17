// const { fetchList } = require("./target/fetch.js");
// const { pubDateSort } = require("./target/pub-sort.js");
// const { createFullResultsList } = require("./target/elements.js");
// const { DatabaseSync } = require("node:sqlite");

// // This is just initalizing all the scripts for the page I wonder if I should break them into smaller files and load them using script elements

// // Initializes scripts for the search
// function initSearch() {
//   window.addEventListener("DOMContentLoaded", () => {
//     document
//       .getElementById("search-submit")
//       .addEventListener("click", async () => {
//         // // Get the name from the form
//         // const character = document.getElementById("character-selection").value;
//         // // Get universe
//         // const universe = document.getElementById("universe-select").value;
//         // console.log(character);

//         const character = createCharacterName();

//         let appearances = await fetchList(character);

//         const sortType = document.getElementById("sort-type").value;
//         switch (sortType) {
//           case "pub-date": {
//             appearances = pubDateSort(appearances);
//             break;
//           }
//         }

//         // TODO: Each search should reset the fields
//         // Order the list as requested either in ascending or descending order
//         if (document.getElementById("ascending").checked) {
//           appearances = appearances.reverse();
//         }

//         // This is the HTML that will list the results
//         let html = "";

//         if (document.getElementById("names-only").checked) {
//           // Just return the list of names and dates if names only is true
//           for (const entry of appearances) {
//             // TODO: I want these on opposite sides of the box and for each one to have alternative colors like grey black
//             html += `<li>${entry.title} ${entry.date.month}/${entry.date.day}/${entry.date.year}</li>`;
//           }
//         } else {
//           createFullResultsList(appearances);
//         }
//         // If names only is checked just return a list of names
//         // Otherwise update the results as a collapsable list of:
//       });
//   });
// }

function createCharacterName(data) {
  // Then trim their entry
  // Then create the string
  // Get the name from the form

  const character = data["character-selection"].trim();

  let result;

  // This does not feel robust since a character might have parentheses for other reasons but mandating it be at the end should catch most edge cases
  if (new RegExp(character).test(/\w|\s (\w)/g)) {
    result = character;
  } else {
    // Get universe and add it to the character name if the universe was not included in the string
    result = character + " " + data["universe-select"].trim();
  }

  return result;
}

// // Adds an event listener for the form submit
// function formSubmit() {
//   window.addEventListener("DOMContentLoaded", () => {
//     const form = document.getElementById("character-search-form");

//     form.addEventListener("submit", (e) => {
//       e.preventDefault();

//       const data = new FormData(e.target);

//       console.log([...data.entries()]);
//     });
//   });
// }

// async function getResults(data) {
//   const character = createCharacterName(data);
//   let appearances = await fetchList(character);

//   const sortType = document.getElementById("sort-type").value;
//   switch (sortType) {
//     case "pub-date": {
//       appearances = pubDateSort(appearances);
//       break;
//     }
//   }

//   return appearances;
// }

module.exports = { createCharacterName };
