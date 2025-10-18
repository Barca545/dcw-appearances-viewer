// TODO: Unsure this needs to be its own file.

function createCharacterName(data) {
  // Get the name from the form
  // Then trim their entry
  // Then create the string

  const character = data["character-selection"].trim();

  let result;

  if (!data["universe-select"]) {
    data["universe-select"] = "(Prime Earth)";
  }

  // This does not feel robust since a character might have parentheses for other reasons but mandating it be at the end should catch most edge cases
  if (new RegExp(character).test(/\w|\s (\w)/g)) {
    result = character;
  } else {
    // Get universe and add it to the character name if the universe was not included in the string
    result = character + " " + data["universe-select"].trim();
  }

  return result;
}

module.exports = { createCharacterName };
