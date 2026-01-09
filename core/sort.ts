import { IssueData, IssueDate } from "./issue_data";

/**Sort list members by publication dates in ascending order (most recent last). Mutates the array in place. Returns a reference to the original array.*/
export function sortCoverDate(list: IssueData[]): IssueData[] {
  return list.sort(({ date: d1 }, { date: d2 }) => IssueDate.cmp(d1, d2));
}

/**Sort list members alphabetically by their titles in ascending order ("A" comes last) recent last. Mutates the array in place. Returns a reference to the original array.*/
export function sortAlphabetical(list: IssueData[]): IssueData[] {
  return list.sort(({ title: d1 }, { title: d2 }) => d1.localeCompare(d2));
}
