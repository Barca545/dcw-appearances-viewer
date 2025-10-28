import fs, { PathLike } from "fs";
import convert from "xml-js";
import { ListEntry } from "./pub-sort.js";
import { templateStringToListEntry } from "./helpers.js";
import { FilterOptions } from "./types.js";

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
    })
  );

  // Convert each appearance into a list entry
  let appearances: ListEntry[] = [];
  for (const entry of json.mediawiki.page) {
    appearances.push(
      templateStringToListEntry(entry.revision.text._text as string)
    );
  }
  return appearances;
}

export interface SaveFormat {
  isApperances: "DC DATABASE APPEARANCE DATA";
  opt: FilterOptions;
  data: ListEntry[];
}

// .txt is probably unnessecary but there is an chance ppl might want plaintext for somereason
type FileType = ".txt" | ".json";

/**Save the  sessions FilterOptions as a json */
export function sessionToJSON(
  opt: FilterOptions,
  data: ListEntry[],
  path: string,
  ftype: FileType = ".json"
) {
  // This ensures the file type is correct
  const pos = path.lastIndexOf(".");
  path = path.substring(0, pos < 0 ? path.length : pos) + ftype;
  // Convert the data to a string
  // TODO: Ensure this still saves with the is appeances field or the file should not load
  const file = JSON.stringify({ opt: opt, data: data } as SaveFormat);
  fs.writeFileSync(path, file, { encoding: "utf8" });
}

export function sessionFromJSON(path: string): SaveFormat | Error {
  // Return early with an error if the wrong filetype is passed
  const ext = path.substring(path.lastIndexOf("."));
  if (!/.txt|.json/.test(ext)) return new Error("Incorrect file type.");
  const file = fs.readFileSync(path, { encoding: "utf8" });
  const data = JSON.parse(file) as SaveFormat;
  // Check if this is the file is format conrrectly
  // TODO: Confirm this returns undef or something if it is missing from the file
  console.log(data);
  if (data.isApperances) return data;
  else return new Error("Incorrect file structure.");
}
