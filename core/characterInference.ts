import { Template } from "./coreTypes";

export function inferCharacter(temp: Template) {
  // Make a list of all names in the template's Appearances field
  // TODO: This might entail finding a more granular way to parse subtemplates
  // Identify the most common one
  // TODO: If two characters have the same number of appearances
  // assume they should both be returned
}
