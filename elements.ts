import { ListEntry } from "./pub-sort.js";

/**Fills out a template to create a list of results with their synopses */
export function createFullResultsList(entries: ListEntry[]) {
  const template = document.querySelector<HTMLTemplateElement>(
    "#template-results-full"
  );

  const parent = document.querySelector("#results") as Element;

  for (const entry of entries) {
    let clone = template?.content
      .querySelector(".result-details")
      ?.cloneNode(true) as DocumentFragment;

    // Set the name
    let name = clone?.querySelector(".result-name") as Element;
    name.textContent = entry.title;
    // Set the date
    let date = clone?.querySelector(".result-date") as Element;
    date.textContent = `${entry.date.month}/${entry.date.day}/${entry.date.year}`;
    // Set the synopsis
    let synopsis = clone.querySelector(".result-body") as Element;
    synopsis.textContent =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    console.log(clone);
    parent.append(clone);

    console.log(parent);
  }
  console.log(parent);
}

export function createPartialResultsList(entries: ListEntry[]) {
  const template = document.querySelector<HTMLTemplateElement>(
    "#template-results-partial"
  );
  let parent = document.querySelector("#results") as Element;
  for (const entry of entries) {
    let clone = template?.content
      .querySelector(".result-title")
      ?.cloneNode(true) as Element;
    // Set the name
    let name = clone?.querySelector(".result-name") as Element;
    name.textContent = entry.title;
    // Set the date
    let date = clone?.querySelector(".result-date") as Element;
    date.textContent = `${entry.date.month}/${entry.date.day}/${entry.date.year}`;
    parent.appendChild(clone);
  }
}
