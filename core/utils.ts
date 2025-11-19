import { TemplateParser } from "./parser.js";
import { TitleAndTemplate, OptionMap } from "./coreTypes.js";
import { ListEntry } from "./pub-sort.js";

/**Convert the text field of the appearances XML into a list entry. */
export function templateStringToListEntry(data: TitleAndTemplate): ListEntry {
  const months = new OptionMap(
    Object.entries({
      January: "1",
      February: "2 ",
      March: "3",
      April: "4",
      May: "5",
      June: "6",
      July: "7",
      August: "8",
      September: "9",
      October: "10",
      November: "11",
      December: "12",
    }),
  );

  // FIXME: This is kinda arbitrary so I don't love it.
  // If there is a better way to handle the season "dates" I want to do that instead
  const seasons = new OptionMap(
    Object.entries({
      // This I super don't like because Winter of a year could be the December or January!
      Winter: "1",
      Spring: "4",
      Summer: "7",
      Fall: "3",
    }),
  );

  const template = new TemplateParser(data.rawTemplate).parse(true);

  // Create the date
  // Need to also pull release date
  const release_date = template.get("Release Date");

  let year: string;
  let month: string;
  let day: string;

  if (release_date.isSome()) {
    const parsed = new Date(release_date.unwrap() as string);
    year = parsed.getUTCFullYear().toString();
    // The JS month is 0 indexed while Day and Year are 1 indexed
    month = (parsed.getUTCMonth() + 1).toString();
    day = parsed.getUTCDate().toString();
  } else {
    year = template.get("Year").unwrap_or(template.get("Pubyear").unwrap_or("")) as string;
    // If no month check for a pub month before going to ""
    month = template.get("Month").unwrap_or(template.get("Pubmonth").unwrap_or("")) as string;

    // This could be more robust but I think the possible values for the month are well defined enough this should be sufficient
    if (isNaN(parseFloat(month))) {
      // If the month is not a number try to get it from the months object
      // If that fails, check the pubdate fields
      // If that fails try to get it from the seasons template
      // If that fails mark with ""
      month = months.get(month).unwrap_or(template.get("Pubmonth").unwrap_or(seasons.get(month).unwrap_or("")) as string);
    }
    day = template.get("Day").unwrap_or(template.get("Pubday").unwrap_or("")) as string;
  }

  const synopsis = template.get("Synopsis1").unwrap_or("Issue is missing a synopsis") as string;

  const entry = new ListEntry(data.title, synopsis, year, month, day, template.get("Link").unwrap_or("") as string);
  return entry;
}
