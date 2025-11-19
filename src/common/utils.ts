import { SearchRequest } from "./apiTypes.js";

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
    result = character + " " + data.universe.trim();
  }

  return result;
}
