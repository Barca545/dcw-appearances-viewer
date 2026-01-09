import { TitleAndTemplate } from "./coreTypes";
import { IssueData, IssueDate } from "./issue_data";
import { OptionMap } from "./OptionMap";
import { TemplateParser } from "./parser";

// TODO: Why is Title not just a template field / if it's a computed field why not compute it in this function?
export function templateToIssueData(data: TitleAndTemplate): IssueData {
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

  const template = new TemplateParser(data.rawTemplate).parse(true);

  let inferred = false;

  const infer = () => {
    // console.log("infer() called from:", new Error().stack);
    inferred = true;
    return "1";
  };

  // Create the date

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

  return IssueData.make(data.title, inferred, synopsis, date, link);
}
