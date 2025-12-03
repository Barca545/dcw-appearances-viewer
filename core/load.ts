import fs from "fs";
import convert from "xml-js";
import { ListEntry } from "./pub-sort.js";
import { templateStringToListEntry } from "./utils.js";
import { FilterOptions } from "../src/common/apiTypes.js";
import path from "path";
import { AppearancesDataResponse } from "./coreTypes.js";

/**
 * Loads and parses a locally stored XML list of appearance data into a list of ListEntrys.
 * @param path
 * @returns
 */
export function loadList(path: Path): ListEntry[] {
  // Load the xml file and convert it to a json
  const json = JSON.parse(
    convert.xml2json(fs.readFileSync(path.path, "utf-8"), {
      compact: true,
      spaces: 4,
    }),
  ) as AppearancesDataResponse;

  // Convert each appearance into a list entry
  let appearances: ListEntry[] = [];
  for (const entry of json.mediawiki.page) {
    appearances.push(templateStringToListEntry({ title: entry.title._text, rawTemplate: entry.revision.text._text }));
  }
  return appearances;
}

// FIXME: Is there a reason this is not a class?
export interface ProjectData {
  header: { appID: "DCDB-Appearance-Viewer"; version: string };
  meta: { character?: string; options: FilterOptions };
  data: ListEntry[];
}

export namespace ProjectData {
  export function empty(): ProjectData {
    return {
      // Unsure if not having versions is theoretically a problem
      header: { appID: "DCDB-Appearance-Viewer", version: "" },
      meta: { options: new FilterOptions() },
      data: [],
    };
  }
}

export interface Character {
  name: string;
  link: string;
}

export class Path {
  readonly path: string;

  constructor(pathStr: string) {
    // FIXME: Confirm it is a valid path and error if not
    if (!fs.existsSync(pathStr)) {
      throw new Error(`${pathStr} does not exist.`);
    }
    this.path = pathStr;
  }

  /**Returns the name of a path's file if it has one */
  fileName(): string {
    return path.basename(this.path);
  }

  /**Returns the filetype of the file the path references. Returns None if there is no extension. */
  ext(): string {
    return path.extname(this.path);
  }
}

/**Save the  sessions FilterOptions as a json */
export function saveProjectDataAsJSON(data: ProjectData, path: Path) {
  // Convert the data to a string
  const file = JSON.stringify(data);
  fs.writeFileSync(path.path, file, { encoding: "utf8" });
}

export function ProjectDataFromJSON(filePath: Path): ProjectData {
  // Return early with an error if the wrong filetype is passed
  if (!/.txt|.json/.test(filePath.ext())) throw new Error("Incorrect file type.");
  const file = fs.readFileSync(filePath.path, { encoding: "utf8" });
  const data = JSON.parse(file) as ProjectData;

  // Convert the entries to list entries because right now they don't actually have the class' metadata and functions
  let entries = [];
  for (const entry of data.data) {
    entries.push(
      new ListEntry(
        entry.title,
        entry.synopsis,
        entry.date.year.toString(),
        entry.date.month.toString(),
        entry.date.day.toString(),
      ),
    );
  }

  data.data = entries;

  // TODO: I would prefer not to hard code this but it's not a huge deal
  if (data.header.appID == "DCDB-Appearance-Viewer") return data;
  else throw Error("Incorrect file structure.");
}
