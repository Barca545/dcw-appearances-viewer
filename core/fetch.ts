import { templateStringToListEntry } from "./helpers.js";
import { xmlToJSON } from "./parser.js";
import { ListEntry } from "./pub-sort.js";

export async function getAppearances(char: string): Promise<string[]> {
  let cmcontinue: string | undefined = "";
  let appearances = [];

  while (cmcontinue != undefined) {
    let params = new URLSearchParams({
      action: "query",
      list: "categorymembers",
      // Sanitize the name
      cmtitle: `Category:${char.replaceAll(/\s/g, "_")}/Appearances`,
      cmlimit: "50",
      format: "json",
    });

    if (cmcontinue) params.set("cmcontinue", cmcontinue);

    const url = new URL(`https://dc.fandom.com/api.php?${params.toString()}`);

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Node.js https request",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    // @ts-ignore
    let data: CategoryMembersResponse = await res.json();

    appearances.push(...data.query.categorymembers);

    cmcontinue = data.continue?.cmcontinue;
  }

  return appearances.map((appearance) => {
    return appearance.title;
  });
}

export async function getRealitiesList(): Promise<any[]> {
  let cmcontinue: string | undefined = "";
  let universes = [];

  while (cmcontinue != undefined) {
    let params = new URLSearchParams({
      action: "query",
      list: "categorymembers",
      // Sanitize the name
      cmtitle: `Category:realities`,
      cmlimit: "50",
      format: "json",
    });

    if (cmcontinue) params.set("cmcontinue", cmcontinue);

    const url = new URL(`https://dc.fandom.com/api.php?${params.toString()}`);

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Node.js https request",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    // @ts-ignore
    let data: CategoryMembersResponse = await res.json();

    universes.push(...data.query.categorymembers);

    cmcontinue = data.continue?.cmcontinue;
  }

  // Filter the words to remove the unwanted prepends
  // Remove parentheses
  // Remove the word category
  universes.forEach((world) => {
    if (world.title.startsWith("Category:")) {
    }
    world.title.replace(/\(|\)/g, "");
  });

  return universes.map((appearance) => {
    return appearance.title;
  });
}

// FIXME: Should return an object fitting the export
/**Returns a string containing the XML file containing the site response. */
export async function getAppearancePages(titles: string[]): Promise<string> {
  // Sanitize the titles to get rid of spaces
  titles = titles.map((title) => {
    return title.replaceAll(/\s/g, "_");
  });

  let params = new URLSearchParams({
    pages: titles.join("\r\n"),
    curonly: "1",
  });

  const url = new URL(`https://dc.fandom.com/Special:Export?${params.toString()}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "User-Agent": "Node.js https request",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.text();
}

/**
 * Fetches the apearance data for the requested character and parses it into a list of ListEntrys.
 * @param path
 * @returns
 */
export async function fetchList(character: string): Promise<ListEntry[]> {
  // Fetch the file and convert it into a json

  const res = await getAppearancePages(await getAppearances(character));

  const json = xmlToJSON(res);

  // Convert each appearance into a list entry
  let appearances: ListEntry[] = [];
  for (const entry of json.mediawiki.page) {
    appearances.push(templateStringToListEntry(entry.revision.text._text as string));
  }

  return appearances;
}
