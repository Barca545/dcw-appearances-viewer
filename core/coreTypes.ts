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
  revisions: {
    slots: { main: { contentmodel: "wikitext"; contentformat: "text/x-wiki"; content: string } };
  }[];
}

/**The title and page template for an appearence. */
export interface TitleAndTemplate {
  title: string;
  rawTemplate: string;
}

// FIXME: I think everything below here is obsolete
// - It is possible the loading still requires this

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
