import { None, Some, Option } from "./option.js";

export interface AppearancesResposeJSONStructure {
  batchcomplete: boolean;
  continue: {
    gcmcontinue: string;
    // TODO: Be even better if it can be narrowed to the two possible values
    continue: string;
  };
  query?: { pages: PageInfo[] };
}

interface PageInfo {
  pageid: number;
  ns: number;
  title: string;
  revisions: Revision[];
}

/**The title and page template for an appearence. */
export interface TitleAndTemplate {
  title: string;
  rawTemplate: string;
}

// TODO: Arguably should be handled the same way I handle options
// type TypedResponse<T> =

export interface Result<T> {
  ok(): boolean;

  unwrap(): T;

  /**Unwraps the error inside a `Result`. Panics if the `Result` is `Ok`. */
  unwrapp_err(): Error;
}

export class Ok<T> implements Result<T> {
  private data: T;

  constructor(data: T) {
    this.data = data;
  }

  unwrap(): T {
    return this.data;
  }

  ok(): true {
    return true;
  }

  unwrapp_err(): Error {
    throw new Error("Called `unwrap_err` on `Ok`.");
  }
}

export class Err<T> implements Result<T> {
  error: Error;

  constructor(error: Error) {
    this.error = error;
  }

  ok(): boolean {
    return false;
  }
  unwrap(): T {
    throw this.error;
  }

  unwrapp_err(): Error {
    return this.error;
  }
}

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

// FIXME: I think everything below here is obsolete
// - It is possible the loading still requires this

interface Revision {
  slots: { main: { contentmodel: "wikitext"; contentformat: "text/x-wiki"; content: string } };
}

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
