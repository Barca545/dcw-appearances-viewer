import { appendFileSync, writeFileSync } from "node:fs";
import { TitleAndTemplate } from "./coreTypes";
import { IssueData, IssueDate } from "./issue_data";
import { OptionMap } from "./OptionMap";
import { TemplateParser } from "./parser";

// FIXME: Should make the template in here

// TODO: Why is Title not just a template field / if it's a computed field why not compute it in this function?
export function templateToIssueData(data: TitleAndTemplate): IssueData {
  // The issue with copy edit is caused by header boxes (i.e. Copy Edit or Stub) so I need to find a way to handle those with parsing
  data.rawTemplate = data.rawTemplate.replace("{{Copy Edit}}", "");
  data.rawTemplate = data.rawTemplate.replace("{{Stub}}", "");
  const months = new OptionMap(
    Object.entries({
      january: "1",
      february: "2 ",
      march: "3",
      april: "4",
      may: "5",
      june: "6",
      july: "7",
      august: "8",
      september: "9",
      october: "10",
      november: "11",
      december: "12",
    }),
  );

  // FIXME: This is kinda arbitrary so I don't love it.
  // If there is a better way to handle the season "dates" I want to do that instead
  const seasons = new OptionMap(
    Object.entries({
      // This I super don't like because Winter of a year could be the December or January!
      winter: "1",
      spring: "4",
      summer: "7",
      fall: "3",
    }),
  );

  const template = new TemplateParser(data.rawTemplate).parse();

  let inferred = false;

  const infer = () => {
    inferred = true;
    return "1";
  };

  // Create the date

  if (data.title.includes("Heroes in Crisis Vol 1 3")) {
    appendFileSync("template.txt", data.rawTemplate + "\n", { encoding: "utf-8" });
    appendFileSync("template_names.txt", data.title + "\n", { encoding: "utf-8" });
  }
  const year = template.get("Year").unwrap_or_else(() => template.get("Pubyear").unwrap_or_else(infer)) as string;

  // month and day get tricky because of issues with seasonal dates like "Spring 1940"
  // They also may list the month by name i.e "April" not 4
  let month = template.get("Month").unwrap_or_else(() => template.get("Pubmonth").unwrap_or_else(infer)) as string;

  // Need to handle the seasonal case
  // If the month is not a number try to get it from the months object
  if (isNaN(parseInt(month))) {
    // Normalize casing in case they're entered differently
    month = month.toLowerCase();
    // Base case cannot be an empty string. It needs to be a number
    month = months.get(month).unwrap_or_else(() => seasons.get(month).unwrap_or_else(infer));
  }

  const day = template.get("Day").unwrap_or_else(() => template.get("Pubday").unwrap_or_else(infer)) as string;

  // TODO: Confirm this returns null when there's no string not an empty string
  const link = (template.get("Link").unwrap_or("") as string) || null;

  // TODO: This needs updating for when issues with multiple stories occur but this is fine for now.
  const synopsis = template.get("Synopsis1").unwrap_or("Issue is missing a synopsis") as string;

  const date = IssueDate.make(year, month, day);

  if (data.title.includes("Heroes in Crisis Vol 1 3")) {
    console.log(template.toString());
    console.log(IssueData.make(data.title, inferred, synopsis, date, link));
    appendFileSync("template.txt", data.rawTemplate + "\n", { encoding: "utf-8" });
    appendFileSync("template_names.txt", data.title + "\n", { encoding: "utf-8" });
  }

  return IssueData.make(data.title, inferred, synopsis, date, link);
}
