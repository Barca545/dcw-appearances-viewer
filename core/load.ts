import fs from "fs";
import convert from "xml-js";
import { ListEntry } from "./pub-sort.js";
import { templateStringToListEntry } from "./helpers.js";
import { FilterOptions } from "../src/common/apiTypes.js";

/**
 * Loads and parses a locally stored XML list of appearance data into a list of ListEntrys.
 * @param path
 * @returns
 */
export function loadList(path: string): ListEntry[] {
  // Load the xml file and convert it to a json
  const json = JSON.parse(
    convert.xml2json(fs.readFileSync(path, "utf-8"), {
      compact: true,
      spaces: 4,
    }),
  );

  // Convert each appearance into a list entry
  let appearances: ListEntry[] = [];
  for (const entry of json.mediawiki.page) {
    appearances.push(templateStringToListEntry(entry.revision.text._text as string));
  }
  return appearances;
}

export interface SaveFormat {
  characters?: Character;
  isAppearances: "DC DATABASE APPEARANCE DATA";
  opt: FilterOptions;
  data: ListEntry[];
}

export interface Character {
  name: string;
  link: string;
}

// .txt is probably unnessecary but there is an chance ppl might want plaintext for somereason
type FileType = ".txt" | ".json";

/**Save the  sessions FilterOptions as a json */
export function sessionToJSON(opt: FilterOptions, data: ListEntry[], path: string, ftype: FileType = ".json") {
  // This ensures the file type is correct
  const pos = path.lastIndexOf(".");
  path = path.substring(0, pos < 0 ? path.length : pos) + ftype;
  // Convert the data to a string
  // TODO: Ensure this still saves with the is appeances field or the file should not load
  const file = JSON.stringify({
    isAppearances: "DC DATABASE APPEARANCE DATA",
    opt: opt,
    data: data,
  } as SaveFormat);
  fs.writeFileSync(path, file, { encoding: "utf8" });
}

export function sessionFromJSON(path: string): SaveFormat {
  // Return early with an error if the wrong filetype is passed
  const ext = path.substring(path.lastIndexOf("."));
  if (!/.txt|.json/.test(ext)) throw new Error("Incorrect file type.");
  const file = fs.readFileSync(path, { encoding: "utf8" });
  const data = JSON.parse(file) as SaveFormat;

  // Convert the entries to list entries because right now they don't actually have the class' metadata and functions
  let entries = [];
  for (const entry of data.data) {
    console.log(entry.synopsis);
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

  if (data.isAppearances) return data;
  else throw Error("Incorrect file structure.");
}
