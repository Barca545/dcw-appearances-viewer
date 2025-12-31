import { Option, Some, None } from "../../core/option";

export enum DisplayDensity {
  Normal = "NORM",
  Dense = "DENSE",
}

export namespace DisplayDensity {
  export function from(value: string): Option<DisplayDensity> {
    if (value === "NORM") return new Some(DisplayDensity.Normal);
    else if (value === "DENSE") return new Some(DisplayDensity.Dense);
    return new None();
  }
}

export enum DisplayOrder {
  PubDate = "PUB",
  AlphaNumeric = "A-Z",
}

export namespace DisplayOrder {
  export function from(value: string): Option<DisplayOrder> {
    if (value === "A-Z") return new Some(DisplayOrder.AlphaNumeric);
    else if (value === "PUB") return new Some(DisplayOrder.PubDate);
    else return new None();
  }
}

export enum DisplayDirection {
  Ascending,
  Descending,
}

export namespace DisplayDirection {
  export function from(value: boolean): DisplayDirection {
    if (value) return DisplayDirection.Ascending;
    else return DisplayDirection.Descending;
  }
}

export interface DisplayOptions {
  order: DisplayOrder;
  density: DisplayDensity;
  dir: DisplayDirection;
  showDates: boolean;
}

export const DEFAULT_FILTER_OPTIONS: DisplayOptions = {
  order: DisplayOrder.PubDate,
  density: DisplayDensity.Normal,
  dir: DisplayDirection.Ascending,
  showDates: true,
};
