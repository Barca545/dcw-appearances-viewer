import { None, Some, Option } from "./option.js";

export interface AppearancesDataResponse {
  mediawiki: {
    _attributes: {
      xmlns: string;
      "xmlns:xsi": string;
      "xsi:schemaLocation": string;
      version: string;
      "xml:lang": string;
    };
    siteinfo: {
      sitename: { _text: string };
      dbname: { _text: string };
      base: { _text: string };
      generator: { _text: string };
      case: { _text: string };
      namespaces: {
        // This namespace tag occurs because it is a group that all shared the tag namespace
        namespace: NameSpace[];
      };
    };
    page: Page[];
  };
}

interface Page {
  title: { _text: string };
  ns: { _text: string };
  id: { _text: string };
  revision: {
    id: { _text: string };
    parentid: { _text: string };
    timestamp: { _text: string };
    contributor: { username: { _text: string }; id: { _text: string } };
    comment?: { _text: string };
    origin: { _text: string };
    model: { _text: string };
    format: { _text: string };
    text: {
      _attributes: {
        bytes: string;
        sha1: string;
      };
      _text: string;
    };
    sha1: { _text: string };
  };
}

interface NameSpace {
  _attributes: { key: string; case: string };
  _text?: string;
}

/** The response to  */
export interface CategoryMembersResponse {
  batchcomplete: string;
  continue: {
    cmcontinue: string;
    continue: string;
  };
  query: { categorymembers: CategoryMember[] };
}

export interface CategoryMember {
  pageid: number;
  ns: number;
  title: string;
}

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

    if (res === undefined) {
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

/**A Map which returns Options instead of value|undefined. */
export class OptionMap<K, V> {
  private data: Map<K, V>;

  constructor(values?: [K, V][]) {
    if (values) {
      this.data = new Map(values);
    } else {
      this.data = new Map();
    }
  }

  /** Set a value in the template. If the field is already assigned, replace the value and return the old value. */
  set(key: K, val: V): Option<V> {
    const ret = this.get(key);
    this.data.set(key, val);
    return ret;
  }

  get(key: K): Option<V> {
    if (this.data.size === 1) {
    }
    const res = this.data.get(key);

    if (res === undefined) {
      return new None();
    } else {
      return new Some(res);
    }
  }
}

export interface Clone<T> {
  clone(): T;
}

export class FilterOptions {
  sortOrder: "PUB" | "A-Z";
  density: "NORM" | "DENSE";
  ascending: boolean;

  /**Create a new set of FilterOptions with the default parameters (density = "NORM", order = "PUB"). */
  constructor() {
    this.density = "NORM";
    this.sortOrder = "PUB";
    this.ascending = true;
  }

  setDensity(dense: "NORM" | "DENSE") {
    this.density = dense;
    return this;
  }
  setOrder(ord: "PUB" | "A-Z") {
    this.sortOrder = ord;
    return this;
  }
  setAscending(asc: boolean) {
    this.ascending = asc;
    return this;
  }
}
