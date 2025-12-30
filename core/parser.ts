import XML from "xml-js";
import { Peekable } from "./iter";
import { AppearancesDataResponse } from "./coreTypes";
import { Template } from "./Template";

// TODO: If this ends up not being robust enough doing something with tokenizing and then a real parser would be the next step

export class TemplateParser {
  readonly src: Peekable<string>;

  constructor(src: string) {
    // This spread syntax converts the string into an array
    this.src = new Peekable([...src]);
  }

  // Parse until a '{' is encountered while (const ch = this.#src.next()) { switch (ch) case '{': {
  // Start parsing template } case '|':{
  // Push the most recent pair of key/value
  parse(top_level: boolean): Template {
    // This is sort of brute force but it's needed to ensure the top level name does not contain {{
    if (top_level) {
      this.consumeIf("{");
      this.consumeIf("{");
    }
    let phase = ParsingStage.Identifier;
    // These are for storing values currently being parsed
    // In the case of parsing a template, it is just appended to the template not tracked by value
    let key = "";
    let value: string | Template = "";
    let name = "";

    let tmplt = new Template();

    // FIXME: Should this return when }} is encounterd regardless of anything else?
    // If so the single name case and the key value case can merge
    for (const ch of this.src) {
      // Need to consume comments
      if (ch == "<" && this.consumeIf("!")) {
        // FIXME: Needs a test
        let index = this.consumeComment();
        while (this.src.index() != index) {
          this.src.next();
        }
        // This is needed so it doesn't continue to the end and append the symbol
        continue;
      }
      if (phase === ParsingStage.Value && ch === "{" && this.consumeIf("{")) {
        // If true, this marks the beginning of a new template and tell the function to recur
        value = this.parse(false);
        phase = ParsingStage.Identifier;
      } else if (ch === "|" && phase === ParsingStage.Identifier) {
        // This signifies we are done parsing the identifier and can switch to parsing the first entry
        // TODO: Might be edge cases if there are "|"s in identifiers
        tmplt.setName(name.trim());
        phase = ParsingStage.Key;
      } else if (ch === "|" && phase != ParsingStage.Identifier) {
        // Store the old (key, value) pair
        // Trim the value if it is a string
        if (typeof value === "string") {
          value = value.trim();
          phase = ParsingStage.Key;
        }
        // FIXME: I don't like making this assumption
        // If there is no key the key value should be the length
        if (key === "") {
          key = tmplt.size().toString();
        }
        tmplt.set(key.trim(), value);

        // Reset for the new (key, value) pair
        key = "";
        value = "";
      } else if (ch === "=" && phase === ParsingStage.Key) {
        phase = ParsingStage.Value;
      } else if (ch === "}" && this.consumeIf("}")) {
        // Should always have a name so this is fine
        tmplt.setName(name.trim());

        // If there is no key cannot insert
        if (key.length != 0) {
          // Trim the value if it is a string
          if (typeof value === "string") {
            value = value.trim();
          }
          // FIXME: Should require key have a unique value
          // Store the final (key, value) pair
          tmplt.set(key.trim(), value);
        }

        return tmplt;
      } else {
        switch (phase) {
          case ParsingStage.Identifier: {
            name += ch;
            break;
          }
          case ParsingStage.Key: {
            key += ch;
            break;
          }
          case ParsingStage.Value: {
            value += ch;
            break;
          }
        }
      }
    }
    return tmplt;
  }

  /**Consume the next character from the src iterator if it matches the expexted character. */
  consumeIf(expected: string): boolean {
    let res = this.src.peek();
    if (res.isSome() && res.unwrap() === expected) {
      // Actually consume by calling next and dropping the result
      this.src.next();
      return true;
    } else {
      return false;
    }
  }

  /**Returns the index where the comment string the source may currently be yielding ends*/
  consumeComment(): number {
    // Clone the source
    let src: Peekable<string> = this.src.clone();

    // Check the next two chars, if they are both '-' then this is a comment and we can eat it.
    if (src.next().value == "-" && src.next().value == "-") {
      // Consume characters until a '-' is reached, check if the next two chars are
      for (const ch of src) {
        // If the character is a "-" confirm whether the next two chars are "-" and ">" and break if so
        if (ch == "-" && src.next().value == "-" && src.next().value == ">") {
          break;
        }
      }
    }

    return src.index();
  }
}

enum ParsingStage {
  Identifier,
  Key,
  Value,
}

export function xmlToJSON(src: string): AppearancesDataResponse {
  const cleaned = src.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9A-Fa-f]+;)/g, "&amp;");
  return JSON.parse(
    XML.xml2json(cleaned, {
      compact: true,
      spaces: 4,
    }),
  );
}
