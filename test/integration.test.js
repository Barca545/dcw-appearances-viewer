import test from "node:test";
import { loadList } from "../load";
import { ListEntry, pubDateSort } from "../pub-sort";
import { isEqual } from "lodash-es";
import assert from "node:assert";
import fs from "fs";
import { fetchList } from "../fetch";

// This is the list expected by the queries
const expected = [
  new ListEntry("Batman Vol 1 1", "1940", "3", "25", ""),
  new ListEntry("Batman Vol 1 2", "1940", "7", "19", ""),
  new ListEntry("Batman Vol 1 3", "1940", "10", "18", ""),
  new ListEntry("Batman Vol 1 10", "1942", "5", "7", ""),
  new ListEntry("World's Finest Vol 1 6", "1942", "7", "", ""),
  new ListEntry("Batman Vol 1 15", "1943", "3", "8", ""),
  new ListEntry("Batman Vol 1 22", "1944", "4", "", ""),
  new ListEntry("Batman Vol 1 35", "1946", "6", "", ""),
  new ListEntry("Batman Vol 1 39", "1947", "2", "", ""),
  new ListEntry("Detective Comics Vol 1 122", "1947", "4", "", ""),
  new ListEntry("Batman Vol 1 42", "1947", "8", "", ""),
  new ListEntry("Batman Vol 1 45", "1948", "2", "", ""),
  new ListEntry("Batman Vol 1 47", "1948", "7", "12", ""),
  new ListEntry("Batman Vol 1 62", "1950", "12", "", ""),
  new ListEntry("Batman Vol 1 65", "1951", "6", "", ""),
  new ListEntry("Batman Vol 1 69", "1952", "2", "", ""),
  new ListEntry("Batman Vol 1 208", "1969", "2", "12", ""),
  new ListEntry(
    "Superman's Girl Friend, Lois Lane Vol 1 123",
    "1972",
    "6",
    "",
    ""
  ),
  new ListEntry("Batman Vol 1 255", "1974", "4", "", ""),
  new ListEntry("Famous First Edition Vol 1 F-5", "1975", "1", "5", ""),
  new ListEntry("Limited Collectors' Edition Vol 1 C-37", "1975", "9", "", ""),
  new ListEntry("Limited Collectors' Edition Vol 1 C-45", "1976", "7", "", ""),
  new ListEntry("DC Super-Stars Vol 1 17", "1977", "12", "", ""),
  new ListEntry("Batman Family Vol 1 17", "1978", "5", "19", ""),
  new ListEntry("Adventure Comics Vol 1 462", "1979", "4", "", ""),
  new ListEntry("Wonder Woman Vol 1 279", "1981", "5", "", ""),
  new ListEntry("Wonder Woman Vol 1 280", "1981", "6", "", ""),
  new ListEntry("Superman Family Vol 1 211", "1981", "10", "", ""),
  new ListEntry("Wonder Woman Vol 1 286", "1981", "12", "", ""),
  new ListEntry("The Brave and the Bold Vol 1 182", "1982", "1", "", ""),
  new ListEntry("The Brave and the Bold Vol 1 184", "1982", "3", "", ""),
  new ListEntry("The Brave and the Bold Vol 1 197", "1983", "4", "", ""),
  new ListEntry("Wonder Woman Vol 1 307", "1983", "9", "", ""),
  new ListEntry("Infinity Inc. Vol 1 2", "1984", "5", "", ""),
  new ListEntry("All-Star Squadron Annual Vol 1 3", "1984", "9", "22", ""),
  new ListEntry("Wonder Woman Vol 1 320", "1984", "10", "", ""),
  new ListEntry(
    "Who's Who: The Definitive Directory of the DC Universe Vol 1 4",
    "1985",
    "6",
    "",
    ""
  ),
  new ListEntry(
    "Last Days of the Justice Society Special Vol 1 1",
    "1986",
    "7",
    "24",
    ""
  ),
  new ListEntry("Detective Comics Vol 1 598", "1989", "3", "", ""),
  new ListEntry("Detective Comics Vol 1 600", "1989", "5", "", ""),
  new ListEntry("Batman Gallery Vol 1 1", "1992", "8", "", ""),
  new ListEntry("Millennium Edition: Batman Vol 1 1", "2001", "2", "", ""),
  new ListEntry("Infinite Crisis Vol 1 3", "2006", "2", "14", ""),
  new ListEntry("Catwoman Vol 3 52", "2006", "4", "22", ""),
  new ListEntry("The Essential Batman Encyclopedia", "2008", "6", "10", ""),
  new ListEntry("Batman Vol 1 686", "2009", "4", "11", ""),
  new ListEntry("Detective Comics Vol 1 853", "2009", "6", "22", ""),
  new ListEntry(
    "Facsimile Edition: DC Super-Stars Vol 1 17",
    "2020",
    "7",
    "5",
    ""
  ),
  new ListEntry(
    "Catwoman 80th Anniversary 100-Page Super Spectacular Vol 1 1",
    "2020",
    "8",
    "2",
    ""
  ),
  new ListEntry("Facsimile Edition: Batman Vol 1 1", "2023", "11", "12", ""),
  new ListEntry(
    "Facsimile Edition: Limited Collectors' Edition Vol 1 37",
    "2025",
    "1",
    "13",
    ""
  ),
];

test("Load, Parse, & Sort", (_t) => {
  // Load the file and turn it into a list of ListEntrys
  const list = loadList(
    process.cwd() + "/test/Selina Kyle (Earth-Two) Appearances.xml"
  );

  // Sort the list
  const result = pubDateSort(list);
  // TODO: This one is pulling from pubmonth not the cover dates
  // If "Fall" or something should also search if pub dates have to be used, use all of them
  // This shows the necessity of standardizing dates when making list entries

  fs.writeFileSync(process.cwd() + "/test/expected", JSON.stringify(expected));
  fs.writeFileSync(process.cwd() + "/test/result", JSON.stringify(result));

  return assert(isEqual(result, expected));
});

test("Fetch, Parse, & Sort", async (_t) => {
  // const titles = await getAppearances("Selina Kyle (Earth-Two)");
  // fs.writeFileSync(
  //   process.cwd() + "/test/fetched appearances",
  //   await getAppearancePages(titles)
  // );
  // Need a fetch as JSON function
  // const json = xmlToJSON(await getAppearancePages(titles));
  // const list = loadList(json);
  const list = await fetchList("Selina Kyle (Earth-Two)");
  const result = pubDateSort(list);

  // Somehow not storing the day for Last Days of the Justice Society Special Vol 1 1 and is saying the field is null not 24
  fs.writeFileSync(process.cwd() + "/test/expected", JSON.stringify(expected));
  fs.writeFileSync(process.cwd() + "/test/result", JSON.stringify(result));

  return assert(isEqual(result, expected));
});
