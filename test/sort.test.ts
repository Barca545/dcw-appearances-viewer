import test from "node:test";
import { sortCoverDate } from "../core/sort";
import { IssueData, IssueDate } from "../core/issue_data";
import assert from "node:assert";
import { isEqual } from "lodash-es";

test("Sort date", (_t) => {
  const d1: IssueDate = {
    year: 2000,
    month: 3,
    day: 10,
  };
  const d2: IssueDate = {
    year: 2001,
    month: 3,
    day: 10,
  };
  const d3: IssueDate = {
    year: 2000,
    month: 4,
    day: 9,
  };
  const d4: IssueDate = {
    year: 2025,
    month: 31,
    day: 10,
  };
  const d5: IssueDate = {
    year: 2026,
    month: 24,
    day: 2,
  };
  const d6: IssueDate = {
    year: 2011,
    month: 11,
    day: 21,
  };

  const issue1 = IssueData.make("", false, "", d1, null);
  const issue2 = IssueData.make("", false, "", d2, null);
  const issue3 = IssueData.make("", false, "", d3, null);
  const issue4 = IssueData.make("", false, "", d4, null);
  const issue5 = IssueData.make("", false, "", d5, null);
  const issue6 = IssueData.make("", false, "", d6, null);

  const unsorted = [issue1, issue2, issue3, issue4, issue5, issue6];
  const sorted = sortCoverDate(unsorted);

  assert(isEqual(sorted, [issue1, issue3, issue2, issue6, issue4, issue5]));
});
