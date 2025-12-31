import { app } from "electron";
import { ListEntry } from "../../core/pub-sort";
import { APPID } from "./utils";
import { DEFAULT_FILTER_OPTIONS, DisplayOptions } from "./displayOptions";
import { loadList, Path } from "../../core/load";
import fs from "fs";

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
    return new ProjectData({ appID: APPID, version: app.getVersion() }, { title: "", character: "", opts: DEFAULT_FILTER_OPTIONS }, []);
  }

  static from(value: SerializedProjectData): ProjectData {
    return new ProjectData(value.header, value.meta, value.list);
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
    fs.writeFileSync(path.fullPath, JSON.stringify(this.list), { encoding: "utf8" });
  }

  /**Loads `ProjectData` from a JSON file. Error if the file is not a JSON. */
  static fromJSON(path: Path): ProjectData {
    // Return early with an error if the wrong filetype is passed
    if (!/.jsonc|.json/.test(path.ext)) throw new Error("Incorrect file type.");
    const file = fs.readFileSync(path.fullPath, { encoding: "utf8" });
    const data = JSON.parse(file) as ProjectData;

    // Convert the entries to list entries because right now they don't actually have the class' metadata and functions
    let entries = [];
    for (const entry of data.list) {
      entries.push(
        new ListEntry(entry.title, entry.synopsis, entry.date.year.toString(), entry.date.month.toString(), entry.date.day.toString()),
      );
    }

    data.list = entries;

    // TODO: I would prefer not to hard code this but it's not a huge deal
    // Check this is the right app or error
    if (data.header.appID == "DCDB-Appearance-Viewer") return data;
    else throw Error("Incorrect file structure.");
  }

  static fromXML(path: Path): ProjectData {
    return ProjectData.from({
      header: { appID: APPID, version: app.getVersion() },
      meta: { character: "", title: path.name, opts: DEFAULT_FILTER_OPTIONS },
      list: loadList(path),
    });
  }
}

// TODO: Figure out if this is actually used. If it is not, delete
// I think this was initially intended for serialization over IPC but I think the TabData stuff replaced it
export interface SerializedProjectData {
  header: { appID: typeof APPID; version: string };
  meta: { character: string; title: string; opts: DisplayOptions };
  list: ListEntry[];
}
