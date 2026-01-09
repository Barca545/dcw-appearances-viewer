import fs from "fs";
import convert from "xml-js";
import { IssueData } from "./issue_data";
import { templateToIssueData } from "./utils";
import path from "path";
import { AppearancesDataResponse } from "./coreTypes";

/**
 * Loads and parses a locally stored XML list of appearance data into a list of `IssueData`.
 * @param path
 * @returns
 */
export function loadList(path: Path): IssueData[] {
  // Load the xml file and convert it to a json
  const json = JSON.parse(
    convert.xml2json(fs.readFileSync(path.fullPath, "utf-8"), {
      compact: true,
      spaces: 4,
    }),
  ) as AppearancesDataResponse;

  // Convert each appearance into a list entry
  let appearances: IssueData[] = [];
  for (const entry of json.mediawiki.page) {
    appearances.push(templateToIssueData({ title: entry.title._text, rawTemplate: entry.revision.text._text }));
  }
  return appearances;
}

export interface Character {
  name: string;
  link: string;
}

/**
 * @field name: The file name without extension.
 * The file extension (if any) such as '.html'
 * @field _ext:
 */
export class Path {
  private _fullPath: string;

  constructor(...segments: string[]) {
    this._fullPath = path.join(...segments);
    // Confirm it is a valid path and error if not
    path.parse(this._fullPath);
  }

  /**Returns the name of a path's file if it has one */
  get fileName(): string {
    return path.basename(this._fullPath, this.ext);
  }

  /**Returns the full path as a string. */
  get fullPath(): string {
    return this._fullPath;
  }

  /**Returns the name of the file or folder the `Path` points to.*/
  get name(): string {
    return path.basename(this._fullPath);
  }

  /**Returns the filetype of the file the path references. Returns None if there is no extension. */
  get ext(): string {
    return path.extname(this._fullPath);
  }

  /**Returns the directory name of the path. */
  get dir(): string {
    return path.dirname(this._fullPath);
  }
}
