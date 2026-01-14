import { DCTemplate } from "../core/Template";
import { templateToIssueData } from "../core/utils";
import { TemplateParser, xmlToJSON } from "../core/parser";
import fs from "fs";
import test from "node:test";
import { TitleAndTemplate } from "../core/coreTypes";
import { assert } from "console";
import { isEqual } from "lodash-es";

// FIXME: wtf_wikipedia's inability to parse nested functions and the DC WIKI's custom functions means I need to write a mini parser for those bits

// test("wtf_wiki_parser", (_t) => {
//   const xml = fs.readFileSync(process.cwd() + "/test/Lian Harper (Prime Earth) Appearances.xml", "utf-8");
//   const list = xmlToJSON(xml);

//   const template = DCTemplate.new(list.mediawiki.page[1].revision.text._text);
//   throw new Error("Test:wtf_wiki_parser not implemented.");
// });

// // TODO: Needs an assert
// test("templateToIssueData", (_t) => {
//   const temp: TitleAndTemplate = { title: "", rawTemplate: "| Month               = 3\n| Year                = 1950" };
//   const template = new TemplateParser("| Month               = 3\n| Year                = 1950").parse(true);
//   const year = template.get("Year").unwrap_or_else(() => template.get("Pubyear").unwrap_or_else(() => "failed")) as string;

//   templateToIssueData(temp);
// });

test("Parsing Heroes in Crisis 3", (_t) => {
  const file = fs.readFileSync("./test/heroes_in_crisis_3_raw.txt", { encoding: "utf-8" });
  const template = new TemplateParser(file).parse();
  assert(isEqual(template.get("Month").unwrap() as string, "1"));
  assert(isEqual(template.get("Day").unwrap() as string, "28"));
  assert(isEqual(template.get("Year").unwrap() as string, "2019"));
});

test("Convert string to issue data", (_t) => {
  const file = fs.readFileSync("./test/heroes_in_crisis_3_raw.txt", { encoding: "utf-8" });
  const issue = templateToIssueData({ title: "", rawTemplate: file });
  assert(isEqual(issue.date, { year: 2019, month: 1, day: 28 }));
  // Why does it work here but fail in prod
});
