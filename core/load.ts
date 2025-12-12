import fs from "fs";
import convert from "xml-js";
import { ListEntry } from "./pub-sort";
import { templateStringToListEntry } from "./utils";
import { DisplayOptions, DEFAULT_FILTER_OPTIONS } from "../src/common/apiTypes";
import path from "path";
import { AppearancesDataResponse } from "./coreTypes";
import { app } from "electron";
import { APPID } from "../src/main/main_utils";

/**
 * Loads and parses a locally stored XML list of appearance data into a list of ListEntrys.
 * @param path
 * @returns
 */
export function loadList(path: Path): ListEntry[] {
  // Load the xml file and convert it to a json
  const json = JSON.parse(
    convert.xml2json(fs.readFileSync(path.path(), "utf-8"), {
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

export interface SerializedProjectData {
  header: { appID: typeof APPID; version: string };
  meta: { character: string; title: string; opts: DisplayOptions };
  list: ListEntry[];
}

// FIXME: Is there a reason this is not a class?
export class ProjectData {
  header: { appID: typeof APPID; version: string };
  meta: { character: string; title: string; opts: DisplayOptions };
  list: ListEntry[];

  private constructor(
    header: { appID: typeof APPID; version: string },
    meta: { character: string; title: string; opts: DisplayOptions },
    list: ListEntry[],
  ) {
    this.header = header;
    this.meta = meta;
    this.list = list;
  }

  /** Create a new, empty, instance of `ProjectData`. */
  static default(): ProjectData {
    return new ProjectData(
      { appID: APPID, version: app.getVersion() },
      { title: "", character: "", opts: DEFAULT_FILTER_OPTIONS },
      [],
    );
  }

  static from(data: SerializedProjectData): ProjectData {
    return new ProjectData(data.header, data.meta, data.list);
  }

  /**Convert `ProjectData` to `SerializedProjectData`.*/
  serialize(): SerializedProjectData {
    return {
      header: this.header,
      meta: this.meta,
      list: this.list,
    };
  }

  saveAsJSON(path: Path) {
    fs.writeFileSync(path.path(), JSON.stringify(this.list), { encoding: "utf8" });
  }
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
  private _path: string;
  private _ext: string;

  constructor(...segments: string[]) {
    const raw = path.join(...segments);
    // FIXME: Confirm it is a valid path and error if not
    if (!fs.existsSync(raw)) {
      throw new Error(`${raw} does not exist.`);
    }

    // Need to handle the possibility the path already has an extension
    const parsed = path.parse(raw);
    this._path = parsed.name;
    this._ext = parsed.ext;
  }

  /**Returns the name of a path's file if it has one */
  fileName(): string {
    return path.basename(this._path);
  }

  /**Returns the full path as a string. */
  path(): string {
    return path.join(this._path, this._ext);
  }

  /**Returns the name of the file or folder the `Path` points to.*/
  name(): string {
    return path.basename(this._path);
  }

  /**Returns the filetype of the file the path references. Returns None if there is no extension. */
  ext(): string {
    return this._ext;
  }
}

/**Save the  sessions FilterOptions as a json */
export function saveProjectDataAsJSON(data: ProjectData, path: Path) {
  // Convert the data to a string
  const file = JSON.stringify(data);
  fs.writeFileSync(path.path(), file, { encoding: "utf8" });
}

export function ProjectDataFromJSON(filePath: Path): ProjectData {
  // Return early with an error if the wrong filetype is passed
  if (!/.txt|.json/.test(filePath.ext())) throw new Error("Incorrect file type.");
  const file = fs.readFileSync(filePath.path(), { encoding: "utf8" });
  const data = JSON.parse(file) as ProjectData;

  // Convert the entries to list entries because right now they don't actually have the class' metadata and functions
  let entries = [];
  for (const entry of data.list) {
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

  data.list = entries;

  // TODO: I would prefer not to hard code this but it's not a huge deal
  if (data.header.appID == "DCDB-Appearance-Viewer") return data;
  else throw Error("Incorrect file structure.");
}
