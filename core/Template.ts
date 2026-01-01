import { None, Some, Option } from "./option";
import wtf from "wtf_wikipedia";

/**An Appearence Template. */
export class Template {
  private name: Option<string>;
  private data: Map<string, Template | string>;

  constructor() {
    this.name = new None();
    this.data = new Map();
  }

  get(key: string): Option<Template | string> {
    if (this.data.size === 1) {
    }
    const res = this.data.get(key);

    if (res === undefined || (res as string) == "") {
      return new None();
    } else {
      return new Some(res);
    }
  }

  // FIXME: See if there us a way to make it so it is never possible to create a template without a name then make getName just return a string

  /**Return the name of the template. */
  getName(): Option<string> {
    return this.name;
  }

  /**Set the name of the Template. */
  setName(name: string): Template {
    this.name = new Some(name);
    return this;
  }

  /** Set a value in the template. If the field is already assigned, replace the value. */
  set(key: string, val: Template | string): Template {
    this.data.set(key, val);
    return this;
  }

  size(): number {
    return this.data.size;
  }

  toString() {
    // TODO: This has to loop through the key value pairs and append them. just printing data returns the Map
    let data = "";
    for (const element of this.data) {
      if (data.length > 0) {
        data += "\n";
      }
      data += JSON.stringify(element);
    }

    return `Template{${this.name.unwrap()}| ${data}}`;
  }
}

export class DCTemplate {
  private entries: Map<string, string>;

  private constructor() {
    this.entries = new Map();
  }

  static new(value: string): DCTemplate {
    let newTemp = new DCTemplate();
    const templates = wtf(value).templates();
    console.log("templates count:", templates.length);

    wtf(value)
      .templates()
      .forEach((temp) =>
        Object.entries(temp.json()).forEach(([k, v]) => {
          // Ignore the metadata for the template
          if (k === "list" || k === "template") return;
          newTemp.entries.set(k, v);
        }),
      );
    return newTemp;
  }

  get(key: string): Option<Template | string> {
    if (this.entries.has(key)) {
      return new Some(this.entries.get(key) as string);
    } else {
      return new None();
    }
  }
}
