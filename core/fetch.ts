import { templateToIssueData } from "./utils";
import { TitleAndTemplate, AppearancesResposeJSONStructure } from "./coreTypes";
import { Err, Ok, ResultInterface } from "./Result";
import { IssueData } from "./issue_data";

export const WIKI_URL = new URL(`https://dc.fandom.com/api.php`);

/**Returns a list containing an interface with the `character`'s appearences' title and the raw string of their template.  */
export async function getAppearances(character: string): Promise<ResultInterface<TitleAndTemplate[]>> {
  // Format the name by clear the spaces out of the name
  character = character.replaceAll(/\s/g, "_");
  let gcmcontinue: string | undefined = "";
  let appearances = [] as TitleAndTemplate[];

  while (gcmcontinue != undefined) {
    let params = new URLSearchParams({
      action: "query",
      // Generators
      // list: "categorymembers",
      generator: "categorymembers",
      gcmtitle: `Category:${character}/Appearances`,
      gcmtype: "page",
      gcmlimit: "50",
      format: "json",
      formatversion: "2",
      utf8: "1",
      // TODO: Figure out why generators don't work,
      // might be a thing because I'm treated as a bot
      // Properties
      prop: "revisions",
      rvprop: "content",
      rvslots: "main",
    });

    if (gcmcontinue) params.set("gcmcontinue", gcmcontinue);

    const res = await fetch(WIKI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Node.js https request",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      throw new Err(new Error(`HTTP error! status: ${res.status}`));
    }

    let data = (await res.json()) as AppearancesResposeJSONStructure;

    if (data.query == undefined) {
      return new Err(new Error("Search failed. Please check the name and try again."));
    }

    // TODO: Ideally a more efficient way to do this
    data.query.pages.forEach((page) => {
      appearances.push({ title: page.title, rawTemplate: page.revisions[0].slots.main.content });
    });

    gcmcontinue = data.continue?.gcmcontinue;
  }

  return new Ok(appearances);
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
      utf8: "1",
    });

    if (cmcontinue) params.set("cmcontinue", cmcontinue);

    const res = await fetch(WIKI_URL, {
      headers: {
        "User-Agent": "Node.js https request",
      },
      body: params.toString(),
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

/**
 * Fetches the apearance data for the requested character and parses it into a list of `IssueData`.
 * @param character
 * @returns Promise<IssueData[]>
 */
export async function fetchList(character: string): Promise<ResultInterface<IssueData[]>> {
  // Fetch the file and convert it into a json

  const res = await getAppearances(character);

  if (!res.is_ok()) {
    return new Err(res.unwrapp_err());
  }

  // Convert each appearance into IssueData
  let appearances: IssueData[] = [];
  for (const issue of res.unwrap()) {
    appearances.push(templateToIssueData(issue));
  }

  return new Ok(appearances);
}
