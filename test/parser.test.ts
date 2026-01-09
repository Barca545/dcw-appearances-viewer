import { DCTemplate } from "../core/Template";
import { templateToIssueData } from "../core/utils";
import { TemplateParser, xmlToJSON } from "../core/parser";
import fs from "fs";
import test from "node:test";
import { TitleAndTemplate } from "../core/coreTypes";

// FIXME: wtf_wikipedia's inability to parse nested functions and the DC WIKI's custom functions means I need to write a mini parser for those bits

test("wtf_wiki_parser", (_t) => {
  const xml = fs.readFileSync(process.cwd() + "/test/Lian Harper (Prime Earth) Appearances.xml", "utf-8");
  const list = xmlToJSON(xml);

  const template = DCTemplate.new(list.mediawiki.page[1].revision.text._text);
  throw new Error("Test:wtf_wiki_parser not implemented.");
});

test("templateToIssueData", (_t) => {
  const temp: TitleAndTemplate = { title: "", rawTemplate: "| Month               = 3\n| Year                = 1950" };
  const template = new TemplateParser("| Month               = 3\n| Year                = 1950").parse(true);
  const year = template.get("Year").unwrap_or_else(() =>
    template.get("Pubyear").unwrap_or_else(() => {
      console.log("infering");
      return "failed";
    }),
  ) as string;

  console.log(year);
  templateToIssueData(temp);
});
