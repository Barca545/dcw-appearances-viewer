import test from "node:test";
import { loadList } from "../load";
import fs from "fs";
import assert from "node:assert";
import { ListEntry } from "../pub-sort";
import { isEqual } from "lodash-es";

test("Load XML convert to JSON then to a list of ListEntry", (_t) => {
  const result = loadList(
    process.cwd() + "/test/Scarlett Scott Apearances.xml"
  );

  const expected = [
    new ListEntry("Detective Comics Vol 1 1090", "2024", "12", "23", ""),
    new ListEntry("Detective Comics Vol 1 1091", "2025", "1", "27", ""),
    new ListEntry("Detective Comics Vol 1 1092", "2025", "2", "26", ""),
    new ListEntry("Detective Comics Vol 1 1093", "2025", "3", "22", ""),
    new ListEntry("Detective Comics Vol 1 1095", "2025", "5", "19", ""),
    new ListEntry("Detective Comics Vol 1 1096", "2025", "6", "16", ""),
  ];

  return assert(isEqual(result, expected));
});
