import { SearchRequest } from "./TypesAPI";

export function createCharacterName(data: SearchRequest): string {
  // Get the name from the form
  // Then trim their entry
  // Then create the string

  const character = data.character.trim();

  let result;

  if (!data.universe) {
    data.universe = "(Prime Earth)";
  }

  // This does not feel robust since a character might have parentheses for other reasons but mandating it be at the end should catch most edge cases

  // This catches if there is a character passed who had a universe typed into their name already
  // i.e. data["character-selection"] = Scarlett Scott (Prime Earth)
  if (new RegExp(/\s\(\w+\)/g).test(character)) {
    result = character;
  } else {
    // Get universe and add it to the character name if the universe was not included in the string
    result = `${character} ${data.universe.trim()}`;
  }

  return result;
}

export function msToMinutes(): number {
  throw new Error("'msToMinutes' is not yet implemented.");
}

export function minutesToMs(): number {
  throw new Error("'minutesToMs' is not yet implemented.");
}

// TODO: This probably belongs somewhere else
// TODO: This needs a different name, really it's checking whether a field matches exactly not just if it exists
// Used to create type guards
// Basically checks if a field exists and has the expected value in an object
export function fieldExists<T extends Record<string, any>>(object: T, key: string, expectedType: string): boolean {
  if (object.hasOwnProperty(key) && typeof object[key] !== "object") {
    return typeof object[key] === expectedType;
  } else if (object.hasOwnProperty(key) && typeof object[key] === "object") {
    return Object.entries(object).every(([k, v]) => fieldExists(object[key], k, typeof v));
  } else {
    return false;
  }
}
