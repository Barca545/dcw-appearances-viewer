import { None, Option, Some } from "../../core/option";

export enum DisplayDensity {
  Normal = "NORM",
  Dense = "DENSE",
}

export namespace DisplayDensity {
  export function from(value: string): Option<DisplayDensity> {
    switch (value.toUpperCase()) {
      case "DENSE": {
        return new Some(DisplayDensity.Dense);
      }
      case "NORM": {
        return new Some(DisplayDensity.Normal);
      }
    }
    return new None();
  }
}

export enum DisplayOrder {
  PubDate = "PUB",
  AlphaNumeric = "A-Z",
}

export namespace DisplayOrder {
  export function from(value: string): Option<DisplayOrder> {
    switch (value) {
      case "A-Z": {
        return new Some(DisplayOrder.AlphaNumeric);
      }
      case "PUB": {
        return new Some(DisplayOrder.PubDate);
      }
    }
    return new None();
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
}

export const DEFAULT_FILTER_OPTIONS: DisplayOptions = {
  order: DisplayOrder.PubDate,
  density: DisplayDensity.Normal,
  dir: DisplayDirection.Ascending,
};

// Keep this flat so it can be iterated over
export interface Settings {
  theme: "system" | "light" | "dark";
  // FIXME: I don't want to have this,
  // just do the same with names and have it autofill
  // with the default value being prime earth
  // earthDropdownType: "user" | "external";
  width: string;
  height: string;
  fontSize: string;
  updateFrequency: "nightly" | "major" | "prompt";
}

// TODO: List entry should be in shared?

export interface AppMessages {
  unsavedChanges: string;
  unimplemented: string;
  illegalFileType: string;
  DevContact: string;
}
