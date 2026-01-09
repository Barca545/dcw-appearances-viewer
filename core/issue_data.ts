import { Temporal } from "temporal-polyfill";

export interface IssueData {
  readonly title: string;
  /**Sometimes the wiki template does not include a date.
   * The `IssueDate` used represents the best possible guess what the date was.
   * This field indicates whether such inference occurred.*/
  readonly dateInferred: boolean;
  readonly date: IssueDate;
  /**The URL of the entry's page on DC Database. */
  readonly URL: string;
  // TODO: I am unclear what this field actually is as it always is empty.
  readonly link: string | null;
  readonly synopsis: string;
}

export namespace IssueData {
  export function make(title: string, dateInferred: boolean, synopsis: string, date: IssueDate, link: string | null): IssueData {
    return {
      title,
      dateInferred,
      date,
      synopsis,
      link: link ?? null,
      URL: `https://dc.fandom.com/wiki/${title.replaceAll(" ", "_")}`,
    };
  }
}

export interface IssueDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

export namespace IssueDate {
  export function make(year: string, month: string, day: string): IssueDate {
    return { year: parseInt(year), month: parseInt(month), day: parseInt(day) };
  }

  /** Returns `-1` if `d1` comes before `d2`, `0` if they are the same, and `1` if `d1` comes after `d2`. */
  export function cmp(d1: IssueDate, d2: IssueDate): -1 | 0 | 1 {
    return Temporal.PlainDateTime.compare(d1, d2);
  }

  /** Returns `true` if `d1` comes before `d2`.*/
  export function gt(d1: IssueDate, d2: IssueDate): boolean {
    return -1 === IssueDate.cmp(d1, d2);
  }

  /** Returns `true` if `d1` comes after `d2`.*/
  export function lt(d1: IssueDate, d2: IssueDate): boolean {
    return 1 === IssueDate.cmp(d1, d2);
  }

  /** Returns `true` if `d1` equals `d2`.*/
  export function eq(d1: IssueDate, d2: IssueDate): boolean {
    return 0 === IssueDate.cmp(d1, d2);
  }

  export function toYYYYMMDD(date: IssueDate): string {
    return `${date.year}/${date.month}/${date.day}`;
  }

  export function toMMDDYYYY(date: IssueDate): string {
    return `${date.month}/${date.day}/${date.year}`;
  }
}
