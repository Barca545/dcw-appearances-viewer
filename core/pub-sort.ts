import { AppearanceData } from "src/common/TypesAPI";

export class ListEntry {
  readonly title: string;
  readonly date: EntryDate;
  readonly link: string;
  readonly synopsis: string;

  // FIXME: Ideally this would only take numbers and entrydate would only be numbers
  constructor(
    title: string,
    synopsis: string,
    year: string | number,
    month: string | number,
    day: string | number,
    link?: string,
  ) {
    this.title = title;
    this.date = new EntryDate(year.toString(), month.toString(), day.toString());
    this.link = link ?? "";
    this.synopsis = synopsis;
  }

  from(data: AppearanceData): ListEntry {
    const date = data.date;
    return new ListEntry(data.title, data.synopsis, date.year, date.month, date.day, data.link);
  }

  toAppearanceData(): AppearanceData {
    return {
      title: this.title,
      date: { year: this.date.day, month: this.date.day, day: this.date.day },
      synopsis: this.synopsis,
      link: this.link,
    };
  }
}

/**Sort List entries by their dates in ascending order */
export function pubDateSort(list: ListEntry[]): ListEntry[] {
  // Sort the list
  return list.sort((a, b) => isBiggerDate(a.date, b.date));
}

/**
 * Check if dateOne is later than dateTwo.
 * @returns Returns 1 if the first argument is greater than the second, 0 if they're equal, and -1 otherwise.
 */
export function isBiggerDate(dateOne: EntryDate, dateTwo: EntryDate): number {
  if (dateOne.isGreater(dateTwo)) {
    return 1;
  } else if (dateOne.isEqual(dateTwo)) {
    return 0;
  } else {
    return -1;
  }
}

export class EntryDate {
  year: number;
  month: number;
  day: number;

  constructor(year: string, month: string, day: string) {
    this.year = parseInt(year);
    this.month = parseInt(month);
    this.day = parseInt(day);
  }

  /**Returns true if `this` is a later date than `other` */
  isGreater(other: EntryDate): boolean {
    if (this.year > other.year) {
      return true;
    } else if (this.year == other.year && this.month > other.month) {
      return true;
    } else if (this.year == other.year && this.month == other.month && this.day > other.day) {
      return true;
    } else {
      return false;
    }
  }

  isEqual(other: EntryDate): boolean {
    if (this.year == other.year && this.month == other.month && this.day == other.day) {
      return true;
    } else {
      return false;
    }
  }
}
