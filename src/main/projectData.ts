import { app } from "electron";
import { IssueData, IssueDate } from "../../core/issue_data";
import { APPID } from "./utils";
import { DEFAULT_FILTER_OPTIONS, DisplayOptions } from "./displayOptions";
import { loadList, Path } from "../../core/load";
import { generateCsv, mkConfig, asString } from "export-to-csv";
import fs from "fs";

export class ProjectData {
  header: { appID: typeof APPID; version: string };
  meta: { characterName: string; title: string; opts: DisplayOptions };
  list: IssueData[];

  private constructor(
    header: { appID: typeof APPID; version: string },
    meta: { characterName: string; title: string; opts: DisplayOptions },
    list: IssueData[],
  ) {
    this.header = header;
    this.meta = meta;
    this.list = list;
  }

  /** Create a new, empty, instance of `ProjectData`. */
  static default(): ProjectData {
    return new ProjectData({ appID: APPID, version: app.getVersion() }, { title: "", characterName: "", opts: DEFAULT_FILTER_OPTIONS }, []);
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
    this.meta.title = path.fileName;
    console.log(this.meta.title);
    fs.writeFileSync(path.fullPath, JSON.stringify(this, null, 2), { encoding: "utf8" });
  }

  saveAsMDList(path: Path) {
    let doc = "";
    this.list.map((entry) => {
      if (this.meta.opts.showDates) {
        doc += `* [${entry.title}](${entry.URL})      ${entry.date.toString()}\n`;
      } else {
        doc += `* [${entry.title}](${entry.URL})\n`;
      }
    });

    this.meta.title = path.fileName;
    fs.writeFileSync(path.fullPath, doc, { encoding: "utf8" });
  }

  /**Save the project's list as a CSV */
  saveAsCSV(path: Path) {
    // Have to flatten the data because it can't handle nested objects
    const raw = this.list.map((issue) => {
      let date: string;
      if (issue.dateInferred) {
        date = "MISSING";
      } else {
        date = IssueDate.toYYYYMMDD(issue.date);
      }
      return { title: issue.title, synopsis: issue.synopsis, date, link: issue.link, URL: issue.URL };
    });
    const csvConfig = mkConfig({ useKeysAsHeaders: true, quoteStrings: true });
    const csv = generateCsv(csvConfig)(raw);

    fs.writeFileSync(path.fullPath, asString(csv), { encoding: "utf8" });
  }

  /**Loads `ProjectData` from a JSON file. Error if the file is not a JSON. */
  static fromJSON(path: Path): ProjectData {
    // Return early with an error if the wrong filetype is passed
    if (!/.jsonc|.json/.test(path.ext)) throw new Error("Incorrect file type.");
    const file = fs.readFileSync(path.fullPath, { encoding: "utf8" });
    const data = JSON.parse(file) as ProjectData;

    // TODO: I would prefer not to hard code this but it's not a huge deal
    // Check this is the right app or error
    if (data.header.appID == "DCDB-Appearance-Viewer") return data;
    else throw Error("Incorrect file structure.");
  }

  static fromXML(path: Path): ProjectData {
    return ProjectData.from({
      header: { appID: APPID, version: app.getVersion() },
      meta: { characterName: "", title: path.name, opts: DEFAULT_FILTER_OPTIONS },
      list: loadList(path),
    });
  }
}

// TODO: Figure out if this is actually used. If it is not, delete
// I think this was initially intended for serialization over IPC but I think the TabData stuff replaced it
export interface SerializedProjectData {
  header: { appID: typeof APPID; version: string };
  meta: { characterName: string; title: string; opts: DisplayOptions };
  list: IssueData[];
}
