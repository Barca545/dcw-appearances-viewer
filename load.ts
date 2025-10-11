import fs from "fs";
import convert from "xml-js";
import { ListEntry } from "./pub-sort.js";
import { TemplateParser } from "./parser.js";
import { OptionMap } from "./types.js";
import { templateStringToListEntry } from "./helpers.js";

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
