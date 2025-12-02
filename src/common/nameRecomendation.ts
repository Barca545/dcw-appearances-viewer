import { WIKI_URL } from "core/fetch";

interface CharacterCache {
  lastUpdate: string;
  cache: Map<string, CharacterSearchData[]>;
}

interface CharacterSearchData {
  name: string;
  // TODO: Is this necessary since the soundex is also the key?
  soundex: string;
}

// Use soundex to grab possible matches
// Use https://en.wikipedia.org/wiki/Levenshtein_distance to rank results and grab the most likely (implementation: https://github.com/gustf/js-levenshtein) minor changes to my implementation https://pastebin.com/stVintrv

function _min(d0: number, d1: number, d2: number, bx: number, ay: number) {
  return d0 < d1 || d2 < d1 ? (d0 > d2 ? d2 + 1 : d0 + 1) : bx === ay ? d1 : d1 + 1;
}

/**Calculate the [Levenstien distance](https://en.wikipedia.org/wiki/Levenshtein_distance) between two words. */
export default function levenshtein(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  let a_len = a.length;
  let b_len = b.length;

  if (a_len > b_len) {
    let tmp = a;
    a = b;
    b = tmp;
  }

  while (a_len > 0 && a.charCodeAt(a_len - 1) === b.charCodeAt(b_len - 1)) {
    a_len--;
    b_len--;
  }

  let offset = 0;

  while (offset < a_len && a.charCodeAt(offset) === b.charCodeAt(offset)) {
    offset++;
  }

  a_len -= offset;
  b_len -= offset;

  if (a_len === 0 || b_len < 3) {
    return b_len;
  }

  let x = 0;
  let y;
  let d0;
  let d1;
  let d2;
  let d3;
  let dd;
  let dy;
  let ay;
  let bx0;
  let bx1;
  let bx2;
  let bx3;

  let vector = [];

  for (y = 0; y < a_len; y++) {
    vector.push(y + 1);
    vector.push(a.charCodeAt(offset + y));
  }

  let len = vector.length - 1;

  for (; x < b_len - 3; ) {
    bx0 = b.charCodeAt(offset + (d0 = x));
    bx1 = b.charCodeAt(offset + (d1 = x + 1));
    bx2 = b.charCodeAt(offset + (d2 = x + 2));
    bx3 = b.charCodeAt(offset + (d3 = x + 3));
    dd = x += 4;
    for (y = 0; y < len; y += 2) {
      dy = vector[y];
      ay = vector[y + 1];
      d0 = _min(dy, d0, d1, bx0, ay);
      d1 = _min(d0, d1, d2, bx1, ay);
      d2 = _min(d1, d2, d3, bx2, ay);
      dd = _min(d2, d3, dd, bx3, ay);
      vector[y] = dd;
      d3 = d2;
      d2 = d1;
      d1 = d0;
      d0 = dy;
    }
  }

  for (; x < b_len; ) {
    bx0 = b.charCodeAt(offset + (d0 = x));
    dd = ++x;
    for (y = 0; y < len; y += 2) {
      dy = vector[y];
      vector[y] = dd = _min(dy, d0, dd, bx0, vector[y + 1]);
      d0 = dy;
    }
  }

  return dd as number;
}

/**Generate the [Soundex](https://en.wikipedia.org/wiki/Soundex) code of a word. */
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

// TODO: This might belong in a different file maybe the fetch one?
// TODO: The last update param is probably not permanent
function updateCharacterCache(cache: CharacterCache) {
  // Load Cache or query cache if open
  // Fetch everything in the "Characters" category  from the site since last update

  let params = new URLSearchParams({
    action: "query",
    list: "categorymembers",
    cmtitle: "Category",
    cmsort: "timestamp",
    format: "json",
    cmstart: cache.lastUpdate,
  });

  const res = fetch(WIKI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Node.js https request",
    },
    body: params.toString(),
  });

  // Create soundexes and story new names properly

  // Overwrite file with results
}

/**Return the first `n` names which match the searched character name */
function nameRecomendations(names: string[], n: number): string[] {
  throw new Error("nameRecomendations is not yet implemented");
}
