import { Template } from "./Template";

export function inferCharacter(temp: Template) {
  // Make a list of all names in the template's Appearances field
  // TODO: This might entail finding a more granular way to parse subtemplates
  // Identify the most common one
  // TODO: If two characters have the same number of appearances
  // assume they should both be returned
}

interface CharactersResCategorymember {
  pageid: number;
  ns: number;
  title: string;
}

// Sort into buckets based on soundex key,  test all this

//**Generate the [Soundex Code](https://en.wikipedia.org/wiki/Soundex) for a given name.*/
// TODO: Might need something more robust since some names will be American
function soundex(name: string): string {
  // This prevents utf characters from being split
  const chars = name.split("");
  let code = chars[0];
  for (let i = 1; i < 4; i++) {
    switch (chars[i]) {
      case "b":
      case "f":
      case "p":
      case "v": {
        code += "1";
        break;
      }
      case "c":
      case "g":
      case "j":
      case "k":
      case "q":
      case "s":
      case "x":
      case "z": {
        code += "2";
        break;
      }
      case "d":
      case "t": {
        code += "3";
        break;
      }
      case "l": {
        code += "4";
        break;
      }
      case "m":
      case "n": {
        code += "5";
        break;
      }
      case "r": {
        code += "6";
        break;
      }
      default: {
        code += "0";
        break;
      }
    }
    // If for some reason,
  }
  while (code.length < 3) {
    code += 0;
  }
  return code;
}
