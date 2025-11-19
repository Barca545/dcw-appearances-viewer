import { ListEntry } from "../../core/pub-sort.js";
// FIXME: Currently these are used in reflow but are purely rendering. These need to be render side

/**Fill out a template to create a list of results with their synopses */
export function createResultsList(entries: ListEntry[]) {
  console.log(entries);
  const template = document.querySelector<HTMLTemplateElement>(`[id="template-results-full"]`);

  const parent = document.querySelector(`[id="results-container"]`) as Element;
  let children = [] as DocumentFragment[];

  for (const entry of entries) {
    let clone = template?.content.querySelector(`[class="result-details"]`)?.cloneNode(true) as DocumentFragment;

    // Set the name
    let name = clone?.querySelector(`[class="result-name"]`) as Element;
    name.textContent = entry.title;
    // Set the date
    let date = clone?.querySelector(`[class="result-date"]`) as Element;

    date.textContent = `${entry.date.month}/${entry.date.day}/${entry.date.year}`;
    // Set the synopsis
    let synopsis = clone.querySelector(`[class="result-body"]`) as Element;
    synopsis.textContent = entry.synopsis;

    name.addEventListener("click", (e) => {
      e.preventDefault();
      window.api.open.url(titleToURL(entry.title));
    });

    children.push(clone);
  }

  parent.replaceChildren(...children);
}

/**Fill the results list with new results */
export function createDenseResultsList(entries: ListEntry[]) {
  const template = document.querySelector<HTMLTemplateElement>("#template-results-partial");

  let parent = document.querySelector(`[id="results-container"]`) as Element;

  let children = [];
  for (const entry of entries) {
    let clone = template?.content.querySelector(`[class="result-title"]`)?.cloneNode(true) as Element;

    // Set the name
    let name = clone?.querySelector(`[class="result-name"]`) as Element;
    name.textContent = entry.title;
    // Set the date
    let date = clone?.querySelector(`[class="result-date"]`) as Element;
    date.textContent = `${entry.date.month}/${entry.date.day}/${entry.date.year}`;
    // Set the link
    let link = clone?.querySelector(`[class="result-url"]`) as HTMLAnchorElement;
    link.href = titleToURL(entry.title);

    // TODO: Honestly is the anchor even necessary?
    name.addEventListener("click", (e) => {
      e.preventDefault();
      window.api.open.url(titleToURL(entry.title));
    });
    children.push(clone);
  }

  parent.replaceChildren(...children);
}

function titleToURL(title: string): string {
  return `https://dc.fandom.com/wiki/${title.replaceAll(" ", "_")}`;
}
