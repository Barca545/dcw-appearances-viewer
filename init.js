const { fetchList } = require("./target/fetch.js");
const { pubDateSort } = require("./target/pub-sort.js");

// Initializes scripts for the search
export function initSearch() {
  window.addEventListener("DOMContentLoaded", () => {
    console.log("init.js running");
    document.getElementById("submit").addEventListener("click", async () => {
      // Get the name from the form
      const character = document.getElementById(
        "target-character-search"
      ).value;
      console.log(character);
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
        for (const entry of appearances) {
          // TODO: Instead of doing it this way, use a template element https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template
          // TODO: I think there is a better way to organize the inside of the paragraph using a grid or something
          html += `<details>
          <summary>${entry.title}</summary>
            <p>
              Date:${entry.date.month}/${entry.date.day}/${entry.date.year}
              <br/>
              Link: ${"THIS WILL EVENTUALLY STORE A LINK TO THE STORY'S PAGE"}
              <br/>
              ${"THIS WILL EVENTUALLY STORE THE SYNOPSIS DATA"}
            </p>
          </details>`;
        }
      }
      document.getElementById("results").innerHTML = html;
      // If names only is checked just return a list of names
      // Otherwise update the results as a collapsable list of:
    });
  });
}
