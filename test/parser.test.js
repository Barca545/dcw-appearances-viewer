import test from "node:test";
import assert from "node:assert";
import { TemplateParser, xmlToJSON as xmlToJSON } from "../parser";
import { isEqual } from "lodash-es";
import fs from "fs";
import { Template } from "../types";

test("consumeIf", (_) => {
  const template = "ABC";
  let parser = new TemplateParser(template);
  return (
    assert.deepEqual(true, parser.consumeIf("A")) &&
    assert.deepEqual("B", parser.src.next())
  );
});

test("Parse single level template w/ key & value", (_) => {
  const template = "{{Name|Key = Value}}";
  const res = new TemplateParser(template).parse(true);
  let expected = new Template();
  expected.setName("Name");
  expected.set("Key", "Value");

  return assert(isEqual(res, expected));
});

test("Parse single level template only name", (_) => {
  const template = "{{Name}}";
  const res = new TemplateParser(template).parse(true);
  let expected = new Template().setName("Name");

  return assert(isEqual(res, expected));
});

test("Parse 2 level nested template only name", (_) => {
  const template = "{{Name|Key = {{Value}}}}";
  const res = new TemplateParser(template).parse(true);
  let expected = new Template();
  expected.setName("Name");
  expected.set("Key", new Template().setName("Value"));

  return assert(isEqual(res, expected));
});

test("Parse 3 level nested template", (_t) => {
  const template = "{{Name|Key = {{Name1|Key1 = {{Name2|Key2 = {{Value}}}}}}}}";
  const res = new TemplateParser(template).parse(true);
  let expected = new Template();
  let name2 = new Template()
    .setName("Name2")
    .set("Key2", new Template().setName("Value"));
  let name1 = new Template().setName("Name1").set("Key1", name2);
  expected.setName("Name").set("Key", name1);

  return assert(isEqual(res, expected));
});

test("XML to JSON", (_t) => {
  const xml = fs.readFileSync(
    process.cwd() + "/test/Scarlett Scott Apearances.xml",
    "utf-8"
  );

  const list = xmlToJSON(xml);

  const expected = {
    mediawiki: {
      _attributes: {
        xmlns: "http://www.mediawiki.org/xml/export-0.11/",
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xsi:schemaLocation":
          "http://www.mediawiki.org/xml/export-0.11/ http://www.mediawiki.org/xml/export-0.11.xsd",
        version: "0.11",
        "xml:lang": "en",
      },
      siteinfo: {
        sitename: { _text: "DC Database" },
        dbname: { _text: "endcdatabase" },
        base: { _text: "https://dc.fandom.com/wiki/DC_Comics_Database" },
        generator: { _text: "MediaWiki 1.43.1" },
        case: { _text: "first-letter" },
        namespaces: {
          namespace: [
            {
              _attributes: { key: "-2", case: "first-letter" },
              _text: "Media",
            },
            {
              _attributes: { key: "-1", case: "first-letter" },
              _text: "Special",
            },
            {
              _attributes: { key: "0", case: "first-letter" },
            },
            {
              _attributes: { key: "1", case: "first-letter" },
              _text: "Talk",
            },
            {
              _attributes: { key: "2", case: "first-letter" },
              _text: "User",
            },
            {
              _attributes: { key: "3", case: "first-letter" },
              _text: "User talk",
            },
            {
              _attributes: { key: "4", case: "first-letter" },
              _text: "DC Database",
            },
            {
              _attributes: { key: "5", case: "first-letter" },
              _text: "DC Database talk",
            },
            {
              _attributes: { key: "6", case: "first-letter" },
              _text: "File",
            },
            {
              _attributes: { key: "7", case: "first-letter" },
              _text: "File talk",
            },
            {
              _attributes: { key: "8", case: "first-letter" },
              _text: "MediaWiki",
            },
            {
              _attributes: { key: "9", case: "first-letter" },
              _text: "MediaWiki talk",
            },
            {
              _attributes: { key: "10", case: "first-letter" },
              _text: "Template",
            },
            {
              _attributes: { key: "11", case: "first-letter" },
              _text: "Template talk",
            },
            {
              _attributes: { key: "12", case: "first-letter" },
              _text: "Help",
            },
            {
              _attributes: { key: "13", case: "first-letter" },
              _text: "Help talk",
            },
            {
              _attributes: { key: "14", case: "first-letter" },
              _text: "Category",
            },
            {
              _attributes: { key: "15", case: "first-letter" },
              _text: "Category talk",
            },
            {
              _attributes: { key: "110", case: "first-letter" },
              _text: "Forum",
            },
            {
              _attributes: { key: "111", case: "first-letter" },
              _text: "Forum talk",
            },
            {
              _attributes: { key: "112", case: "first-letter" },
              _text: "News",
            },
            {
              _attributes: { key: "113", case: "first-letter" },
              _text: "News talk",
            },
            {
              _attributes: { key: "114", case: "first-letter" },
              _text: "Blogs",
            },
            {
              _attributes: { key: "115", case: "first-letter" },
              _text: "Blogs talk",
            },
            {
              _attributes: { key: "116", case: "first-letter" },
              _text: "Portal",
            },
            {
              _attributes: { key: "117", case: "first-letter" },
              _text: "Portal talk",
            },
            {
              _attributes: { key: "118", case: "first-letter" },
              _text: "DC Universe",
            },
            {
              _attributes: { key: "119", case: "first-letter" },
              _text: "DC Universe talk",
            },
            {
              _attributes: { key: "420", case: "first-letter" },
              _text: "GeoJson",
            },
            {
              _attributes: { key: "421", case: "first-letter" },
              _text: "GeoJson talk",
            },
            {
              _attributes: { key: "500", case: "first-letter" },
              _text: "User blog",
            },
            {
              _attributes: { key: "501", case: "first-letter" },
              _text: "User blog comment",
            },
            {
              _attributes: { key: "502", case: "first-letter" },
              _text: "Blog",
            },
            {
              _attributes: { key: "503", case: "first-letter" },
              _text: "Blog talk",
            },
            {
              _attributes: { key: "828", case: "first-letter" },
              _text: "Module",
            },
            {
              _attributes: { key: "829", case: "first-letter" },
              _text: "Module talk",
            },
            {
              _attributes: { key: "1200", case: "first-letter" },
              _text: "Message Wall",
            },
            {
              _attributes: { key: "1201", case: "first-letter" },
              _text: "Thread",
            },
            {
              _attributes: { key: "1202", case: "first-letter" },
              _text: "Message Wall Greeting",
            },
            {
              _attributes: { key: "2000", case: "first-letter" },
              _text: "Board",
            },
            {
              _attributes: { key: "2001", case: "first-letter" },
              _text: "Board Thread",
            },
            {
              _attributes: { key: "2002", case: "first-letter" },
              _text: "Topic",
            },
            {
              _attributes: { key: "2900", case: "first-letter" },
              _text: "Map",
            },
            {
              _attributes: { key: "2901", case: "first-letter" },
              _text: "Map talk",
            },
          ],
        },
      },
      page: [
        {
          title: { _text: "Detective Comics Vol 1 1090" },
          ns: { _text: "0" },
          id: { _text: "774350" },
          revision: {
            id: { _text: "3767913" },
            parentid: { _text: "3765763" },
            timestamp: { _text: "2025-04-27T14:45:36Z" },
            contributor: {
              username: { _text: "Cmanigold" },
              id: { _text: "36766115" },
            },
            origin: { _text: "3767913" },
            model: { _text: "wikitext" },
            format: { _text: "text/x-wiki" },
            text: {
              _attributes: {
                bytes: "3897",
                sha1: "efql024abr2ch2p34bguyzcnllk6s1t",
                "xml:space": "preserve",
              },
              _text: `{{DC Database:Comic Template
| Title               = Detective Comics
| Image               = Detective Comics Vol 1 1090.jpg
| Image2              = Detective Comics Vol 1 1090 Textless.jpg
| Image4              = Detective Comics Vol 1 1090 Textless Variant.jpg
| Image4Text          = Textless Variant
| Image5              = Detective Comics Vol 1 1090 Textless Harris  Variant.jpg
| Image5Text          = Textless 1:25 Variant
| Image6              = Detective Comics Vol 1 1090 Textless Redondo Variant.jpg
| Image6Text          = Textless Bruno Redondo Variant
| Image7              = Detective Comics Vol 1 1090 Textless Wood  Variant.jpg
| Image7Text          = Textless Ashley Wood  Variant
| Volume              = 1
| Issue               = 1090
| Day                 = 23
| Month               = 12
| Year                = 2024
| Rating              = T
| Event               = All In

| Executive Editor    = Marie Javins
| CoverArtist1        = Mikel Janín
| Cover2Artist1       = Bruno Redondo
| Cover3Artist1       = Dan Panosian
| Cover4Artist1       = Tony Harris
| Cover4Artist2       = Jeremy Clark
| Cover5Artist1       = Daniel Sampere
| Cover5Artist2       = Alejandro Sánchez
| Cover6Artist1       = Ashley Wood

| Writer1_1           = Tom Taylor
| Penciler1_1         = Mikel Janín
| Inker1_1            = Mikel Janín
| Colorist1_1         = Mikel Janín
| Letterer1_1         = Wes Abbott
| Editor1_1           = Jessica Berbey
| Editor1_2           = Ben Meares
| Editor1_3           = Rob Levin

| Quotation           = Could I have saved [[Martha Kane (Prime Earth)|their]] [[Thomas Wayne (Prime Earth)|lives]]?
| Speaker             = [[Bruce Wayne (Prime Earth)|Batman (Bruce Wayne)]]

| StoryTitle1         = Mercy of the Father, Part One
| Synopsis1           = 

| Appearing1          = 
'''Featured Characters:'''
* {{a|[[Bruce Wayne (Prime Earth)|Batman (Bruce Wayne)]]}} {{Flashalso}} {{Green|Also in a flashforward}}
'''Supporting Characters:'''
* {{a|[[Alfred Pennyworth (Prime Earth)|Alfred Pennyworth]]}} {{Deceased}} {{Flashback}}
* {{a|[[Barbara Gordon (Prime Earth)|Oracle (Barbara Gordon)]]}}
* {{a|[[Scarlett Scott (Prime Earth)|Scarlett Scott]]}} {{1st}} {{Flashalso}}
* {{a|[[Wayne Family]]}} {{Deceased}} {{Flashback}}
** {{a|[[Martha Kane (Prime Earth)|Martha Wayne]]}} 
** {{a|[[Thomas Wayne (Prime Earth)|Thomas Wayne]]}}
'''Antagonists'''
* {{a|[[Joseph Chilton (Prime Earth)|Joe Chill (Joseph Chilton)]]}} {{Flashback}}
* Sam Kristoff <small>(Child robber)</small> {{1st Dies}}
'''Other Characters:'''
* Daniel O'Malley {{1st}}
* {{a|[[Evelyn Scott (Prime Earth)|Evelyn Scott]]}} {{1st}} {{Flashback}}
* Gina O'Malley {{1st}}
* {{a|[[Gotham City Police Department]]}} {{Cameo}}
* [[Waynetech]] {{Mentioned}}
'''Locations:'''
* {{a|[[Prime Earth|Earth 0]]}}
** {{a|[[United States of America]]}}
*** {{a|[[Gotham City]]}} {{Green|Flashforward and main story}}
**** Bill Finger Ave
***** Gotham St. Matthew Hospital {{Flashback}}
**** {{a|[[Gotham Clock Tower]]}}
**** {{a|[[Wayne Manor]]}} {{Flashback}}
**** Williamson
'''Items:'''
* {{a|[[Batsuit]]}}
** {{a|[[Batrope]]}}
** {{a|[[Utility Belt]]}}
* [[Holy Grail]] {{Mentioned}}
* [[Green Lantern Ring]] {{Unnamed}} {{Mentioned}}
* Sangraal (drug) {{1st}}
'''Concepts:'''
* [[Emotional Electromagnetic Spectrum]] {{Unnamed}} {{Mentioned}}
* [[Magic]] {{Mentioned}}
* [[Metahumans]] {{Mentioned}}

| Notes               =
* This story takes place in early November {{a|[[2024]]}}, two months after the ''[[Absolute Power (event)|Absolute Power]]'' event.
** It also take place one year after the epilogue of the ''[[Gotham Nocturne]]'' storyline, which takes place around November [[2023]], in the previous issue. 
| Trivia              =
* Bill Finger Ave is obviously a reference to [[Batman]]'s creator, [[Bill Finger]].
| Recommended         = {{Batman RR}}
| Links               = 
}}`,
            },
            sha1: { _text: "efql024abr2ch2p34bguyzcnllk6s1t" },
          },
        },
        {
          title: { _text: "Detective Comics Vol 1 1091" },
          ns: { _text: "0" },
          id: { _text: "777483" },
          revision: {
            id: { _text: "3765764" },
            parentid: { _text: "3680320" },
            timestamp: { _text: "2025-04-18T10:48:58Z" },
            contributor: {
              username: { _text: "Cmanigold" },
              id: { _text: "36766115" },
            },
            origin: { _text: "3765764" },
            model: { _text: "wikitext" },
            format: { _text: "text/x-wiki" },
            text: {
              _attributes: {
                bytes: "3388",
                sha1: "eolcr55x7u9n2lbtarrlxj8vlnpjz79",
                "xml:space": "preserve",
              },
              _text: `{{DC Database:Comic Template
| Title               = Detective Comics
| Image               = Detective Comics Vol 1 1091.jpg
| Image2              = Detective Comics Vol 1 1091 Textless.jpg
| Image4              = Detective Comics Vol 1 1091 Textless Variant.jpg
| Image4Text          = Textless Variant
| Image5              = Detective Comics Vol 1 1091 Textless Wood  Variant.jpg
| Image5Text          = Textless 1:25 Variant
| Image6              = 
| Image6Text          = 
| Image7              = 
| Image7Text          = 
| Volume              = 1
| Issue               = 1091
| Day                 = 27
| Month               = 1
| Year                = 2025
| Rating              = T
| Event               = All In

| Executive Editor    = Marie Javins
| CoverArtist1        = Mikel Janín
| Cover2Artist1       = Bruno Redondo
| Cover3Artist1       = Simon Bisley 
| Cover4Artist1       = Ashley Wood
| Cover4Artist2       = 
| Cover5Artist1       = 
| Cover5Artist2       = 
| Cover6Artist1       = 

| Writer1_1           = Tom Taylor
| Penciler1_1         = Mikel Janín
| Inker1_1            = Mikel Janín
| Colorist1_1         = Mikel Janín
| Letterer1_1         = Wes Abbott
| Editor1_1           = Jessica Berbey
| Editor1_2           = Ben Meares
| Editor1_3           = Rob Levin

| Quotation           = How can I support this, if I'm the only one who benefits?
| Speaker             =[[Bruce Wayne (Prime Earth)|Batman (Bruce Wayne)]]

| StoryTitle1         = Mercy of the Father, Part Two
| Synopsis1           = 

| Appearing1          = 
'''Featured Characters:'''
* {{a|[[Bruce Wayne (Prime Earth)|Batman (Bruce Wayne)]]}} {{Dreamalso}}
'''Supporting Characters:'''
* {{a|[[Gotham City Police Department]]}}
** {{a|[[Harvey Bullock (Prime Earth)|Det. Bullock]]}}
* {{a|[[Barbara Gordon (Prime Earth)|Oracle (Barbara Gordon)]]}}
* {{a|[[Damian Wayne (Prime Earth)|Robin (Damian Wayne)]]}}
* {{a|[[Scarlett Scott (Prime Earth)|Scarlett Scott]]}} {{Flashalso}}
** [[Evelyn Scott (Prime Earth)|"Dr. Forster"]] {{1st}}
* {{a|[[Kal-El (Prime Earth)|Superman (Clark Kent)]]}}
'''Antagonists'''
* {{a|[[Evelyn Scott (Prime Earth)|Asema]]}} {{Unnamed}} {{Cameo}} 
* {{a|[[Joker (Prime Earth)|Joker]]}} {{Dream}}
* {{a|[[Oswald Cobblepot (Prime Earth)|Penguin]]}}
** Penguin's Gang
'''Other Characters:'''
* Deceased children
** Samuel "Sam" Kristoff {{Corpse}} {{Dreamalso}}
* {{a|[[Harpies]]}} {{Statue}}
* Kai Edwards {{1st}} {{ApDeath}}
* [[Bat-Family]] {{Mentioned}}
* [[Demons]] {{Mentioned}}
* [[Kryptonians]] {{Deceased}} {{Mentioned}}
* [[Lois Lane (Prime Earth)|Lois Lane]] {{Mentioned}}
'''Locations:'''
* {{a|[[Prime Earth|Earth 0]]}}
** {{a|[[United States of America]]}}
*** {{a|[[Gotham City]]}} {{Dreamalso}}
**** Gotham Coroner Office
**** {{a|[[Iceberg Lounge]]}}
**** {{a|[[Pennyworth Manor]]}}
***** {{a|[[Batcave]]}}
**** {{a|[[Elixir (organization)|Theromise Health Headquarters]]}} {{1st}}
**** Three Seasons Hotel {{1st}}
***** Room 834 {{1st}}
* {{a|[[Sphere of the Gods]]}}
** {{a|[[Dreaming|Dreamtime]]}} 
'''Items:'''
* {{a|[[Batsuit]]}}
** {{a|[[Utility Belt]]}}
* {{a|[[Penguin's Umbrella]]}}
* Sangraal (drug) {{1stFull}} {{Flashalso}}
'''Vehicles:'''
* {{a|[[Batmobile]]}}
'''Events:'''
* [[Death of Superman]] {{Mentioned}}

| Notes               =
| Trivia              =
| Recommended         = {{Batman RR}}
| Links               = 
}}`,
            },
            sha1: { _text: "eolcr55x7u9n2lbtarrlxj8vlnpjz79" },
          },
        },
        {
          title: { _text: "Detective Comics Vol 1 1092" },
          ns: { _text: "0" },
          id: { _text: "779179" },
          revision: {
            id: { _text: "3765767" },
            parentid: { _text: "3709693" },
            timestamp: { _text: "2025-04-18T10:49:13Z" },
            contributor: {
              username: { _text: "Cmanigold" },
              id: { _text: "36766115" },
            },
            origin: { _text: "3765767" },
            model: { _text: "wikitext" },
            format: { _text: "text/x-wiki" },
            text: {
              _attributes: {
                bytes: "3556",
                sha1: "142bznhfniq7lq7y4ihl6mrlt9cnrcd",
                "xml:space": "preserve",
              },
              _text: `{{DC Database:Comic Template
| Title               = Detective Comics
| Image               = Detective Comics Vol 1 1092.jpg
| Image2              = Detective Comics Vol 1 1092 Textless.jpg
| Image4              = Detective Comics Vol 1 1092 Textless Variant.jpg
| Image4Text          = Textless Variant
| Image5              = Detective Comics Vol 1 1092 Textless Mitten  Variant.jpg
| Image5Text          = Textless 1:25 Variant
| Image6              = Detective Comics Vol 1 1092 Textless  Wood Variant.jpg
| Image6Text          = Textless Ashley Wood Variant
| Image7              = 
| Image7Text          = 
| Volume              = 1
| Issue               = 1092
| Day                 = 26
| Month               = 2
| Year                = 2025
| Rating              = T
| Event               = All In

| Executive Editor    = Marie Javins
| CoverArtist1        = Mikel Janín
| Cover2Artist1       = Stevan Subic
| Cover3Artist1       = Christopher Mitten
| Cover4Artist1       = Ashley Wood
| Cover4Artist2       = 
| Cover5Artist1       = 
| Cover5Artist2       = 
| Cover6Artist1       = 

| Writer1_1           = Tom Taylor
| Penciler1_1         = Mikel Janín
| Inker1_1            = Mikel Janín
| Colorist1_1         = Mikel Janín
| Letterer1_1         = Wes Abbott
| Editor1_1           = Jessica Berbey
| Editor1_2           = Ben Meares
| Editor1_3           = Rob Levin

| Quotation           = Are [[Batman (Bruce Wayne)|Batman and Bruce Wayne]] doing some kind of covert team-up?
| Speaker             = [[Barbara Gordon (Prime Earth)|Oracle (Barbara Gordon)]]

| StoryTitle1         = Mercy of the Father, Part Three
| Synopsis1           = 

| Appearing1          = 
'''Featured Characters:'''
* {{a|[[Bruce Wayne (Prime Earth)|Batman (Bruce Wayne)]]}} {{Dreamalso}}
'''Supporting Characters:'''
* {{a|[[Batman Family|Bat-Family]]}}
** {{a|[[Barbara Gordon (Prime Earth)|Oracle (Barbara Gordon)]]}}
** {{a|[[Damian Wayne (Prime Earth)|Robin (Damian Wayne)]]}}
* {{a|[[Gotham City Police Department]]}}
** {{a|[[Harvey Bullock (Prime Earth)|Det. Bullock]]}}
* {{a|[[Scarlett Scott (Prime Earth)|Scarlett Scott]]}} 
'''Antagonists'''
* {{a|[[Evelyn Scott (Prime Earth)|Asema]]}} {{Unnamed}} 
* {{a|[[Elixir (organization)|LXR]]}} {{1st}}
* Unnamed muggers {{Only}}
'''Other Characters:'''
* {{a|[[Haley the Dog (Prime Earth)|Haley the Dog]]}} {{Green|See Notes}}
* [[Evelyn Scott (Prime Earth)|Evelyn Scott]] {{Mentioned}}
* Faultless CEO {{Unnamed}} {{Mentioned}}
* [[Vandal Savage (Prime Earth)|Commissioner Savage]] {{Mentioned}}
* [[Wayne Family]] {{Deceased}}
** [[Martha Kane (Prime Earth)|Martha Wayne]] {{Mentioned}}
** [[Thomas Wayne (Prime Earth)|Thomas Wayne]] {{Mentioned}}
'''Locations:'''
* {{a|[[Prime Earth|Earth 0]]}}
** {{a|[[United States of America]]}}
*** {{a|[[Gotham City]]}} {{Dreamalso}}
**** {{a|[[Gotham Clock Tower]]}}
**** Lucas Reese Steakhouse {{Only}}
**** [[Pennyworth Manor]] {{BTS}}
***** {{a|[[Batcave]]}}
**** Penthouse of Scarlett Scott {{1st}}
**** [[Elixir (organization)|Theromise Health Industries]]
**** Three Seasons Hotel 
***** Room 834 
**** Faultless Juveline Center {{Mentioned}}
'''Items:'''
* {{a|[[Batcomputer]]}}
* {{a|[[Batsuit]]}}
** {{a|[[Batrope]]s}}
** {{a|[[Utility Belt]]s}}
* {{a|[[Holy Grail]]}} {{Picture}}
* Sangraal (drug)
'''Vehicles:'''
* Scarlett Scott's car

| Notes               =
* The dog from the Clock Tower is meant to be Haley: however, she doesn't have a missing paw.
| Trivia              =
| Recommended         = {{Batman RR}}
| Links               = 
}}`,
            },
            sha1: { _text: "142bznhfniq7lq7y4ihl6mrlt9cnrcd" },
          },
        },
        {
          title: { _text: "Detective Comics Vol 1 1093" },
          ns: { _text: "0" },
          id: { _text: "780484" },
          revision: {
            id: { _text: "3772132" },
            parentid: { _text: "3772086" },
            timestamp: { _text: "2025-05-15T19:23:23Z" },
            contributor: {
              username: { _text: "Legionaire315" },
              id: { _text: "47817113" },
            },

            comment: {
              _text:
                "Undo revision [[Special:Diff/3772086|3772086]] by [[Special:Contributions/Khing|Khing]] ([[User talk:Khing|talk]]) Don’t just add hyperlinks like that",
            },
            origin: { _text: "3772132" },
            model: { _text: "wikitext" },
            format: { _text: "text/x-wiki" },
            text: {
              _attributes: {
                bytes: "3793",
                sha1: "gh37ph29ox1lvyn0l77w6ht02fdzftw",
                "xml:space": "preserve",
              },
              _text: `{{DC Database:Comic Template
| Title               = Detective Comics
| Image               = Detective Comics Vol 1 1093.jpg
| Image2              = Detective Comics Vol 1 1093 Textless.jpg
| Image4              = Detective Comics Vol 1 1093 Textless Variant.jpg
| Image4Text          = Textless Variant
| Image5              = Detective Comics Vol 1 1093 Textless Ferreyra  Variant.jpg
| Image5Text          = Textless 1:25 Variant
| Image6              = 
| Image6Text          = 
| Image7              = 
| Image7Text          = 
| Volume              = 1
| Issue               = 1093
| Day                 = 22
| Month               = 3
| Year                = 2025
| Rating              = T
| Event               = All In

| Executive Editor    = Marie Javins
| CoverArtist1        = Mikel Janín
| Cover2Artist1       = Dan Panosian
| Cover3Artist1       = Juan Ferreyra
| Cover4Artist1       = 
| Cover4Artist2       = 
| Cover5Artist1       = 
| Cover5Artist2       = 
| Cover6Artist1       = 

| Writer1_1           = Tom Taylor
| Penciler1_1         = Mikel Janín
| Inker1_1            = Mikel Janín
| Colorist1_1         = Mikel Janín
| Letterer1_1         = Wes Abbott
| Editor1_1           = Jessica Berbey
| Editor1_2           = Ben Meares
| Editor1_3           = Rob Levin

| Quotation           = You small, small man.
| Speaker             = [[Bruce Wayne (Prime Earth)|Batman (Bruce Wayne)]]

| StoryTitle1         = Mercy of the Father, Part Four
| Synopsis1           = 

| Appearing1          = 
'''Featured Characters:'''
* {{a|[[Bruce Wayne (Prime Earth)|Batman (Bruce Wayne)]]}} {{Flashalso}}
'''Supporting Characters:'''
* {{a|[[Batman Family|Bat-Family]]}}
** {{a|[[Alfred Pennyworth (Prime Earth)|Alfred Pennyworth]]}} {{Deceased}} {{Flashback}}
** {{a|[[Barbara Gordon (Prime Earth)|Batgirl/Oracle (Barbara Gordon)]]}}
** {{a|[[Stephanie Brown (Prime Earth)|Batgirl (Stephanie Brown)]]}}
** {{a|[[Jason Todd (Prime Earth)|Red Hood (Jason Todd)]]}}
** {{a|[[Damian Wayne (Prime Earth)|Robin (Damian Wayne)]]}}
** {{a|[[Timothy Drake (Prime Earth)|Robin (Tim Drake)]]}}
** {{a|[[Duke Thomas (Prime Earth)|The Signal (Duke Thomas)]]}} 
'''Antagonists'''
* {{a|[[Evelyn Scott (Prime Earth)|Asema]]}} {{Green|Real name revealed}} 
* Georgiev <small>(Mercenary)</small> {{Only}}
* Spencer Robertson's stepfather {{Only}} {{Unnamed}}
'''Other Characters:'''
* {{a|[[Evelyn Scott (Prime Earth)|Evelyn Scott]]}} {{1st}} {{Flashback}}
* Faultless Juveline Center children
** Nicolas Fairgray {{1st}}
** Spencer Robertson <small>(Abused child)</small> {{1st}}
* [[Evelyn Scott (Prime Earth)|"Dr. Forster"]] {{Cameo}}
* {{a|[[Gargoyles]]}} {{Statue}} {{Cameo}}
* {{a|[[Oswald Cobblepot (Prime Earth)|The Penguin]]}}
* {{a|[[Scarlett Scott (Prime Earth)|Scarlett Scott]]}} {{Flashalso}}
* [[Gotham City Police Department]] {{Mentioned}}
** Henderson {{Mentioned}}
** Ortega {{Mentioned}}
* [[Martha Kane (Prime Earth)|Martha Wayne]] {{Deceased}} {{Mentioned}}
* Spencer Robertson's mother {{Unnamed}} {{Mentioned}}
* [[Thomas Wayne (Prime Earth)|Thomas Wayne]] {{Deceased}} {{Mentioned}}
'''Locations:'''
* {{a|[[Prime Earth|Earth 0]]}}
** {{a|[[United States of America]]}}
*** {{a|[[Gotham City]]}} 
**** {{a|[[Iceberg Lounge]]}}
**** {{a|[[Elixir (organization)|Theromise Health Industries]]}}
**** {{a|[[Wayne Manor]]}} {{Flashback}}
**** Faultless Juveline Center {{Mentioned}}
'''Items:'''
* [[Bat-Signal]] {{Mentioned}}
* {{a|[[Batsuit]]s}}
** {{a|[[Batrope]]s}}
** {{a|[[Utility Belt]]s}}
* {{a|[[Penguin's Umbrella]]}}
* Sangraal (drug) {{Mentioned}}
'''Vehicles:'''
* <br/>

| Notes               =
| Trivia              =
* The mercenary Georgiev is a homage to the DC artist, [[Vasco Georgiev]].
| Recommended         = {{Batman RR}}
| Links               = 
}}`,
            },
            sha1: { _text: "gh37ph29ox1lvyn0l77w6ht02fdzftw" },
          },
        },
        {
          title: { _text: "Detective Comics Vol 1 1095" },
          ns: { _text: "0" },
          id: { _text: "783025" },
          revision: {
            id: { _text: "3765768" },
            parentid: { _text: "3714995" },
            timestamp: { _text: "2025-04-18T10:49:18Z" },
            contributor: {
              username: { _text: "Cmanigold" },
              id: { _text: "36766115" },
            },
            origin: { _text: "3765768" },
            model: { _text: "wikitext" },
            format: { _text: "text/x-wiki" },
            text: {
              _attributes: {
                bytes: "3597",
                sha1: "0bzvxzxh50llmaic654wh4zek96m60p",
                "xml:space": "preserve",
              },
              _text: `{{DC Database:Comic Template
| Title               = Detective Comics
| Image               = Detective Comics Vol 1 1095.jpg
| Image2              = Detective Comics Vol 1 1095 Textless.jpg
| Image4              = Detective Comics Vol 1 1095 Textless Variant.jpg
| Image4Text          = Textless Variant
| Image5              = Detective Comics Vol 1 1095 Textless Shawn Variant.jpg
| Image5Text          = Textless 1:25 Variant
| Image6              = Detective Comics Vol 1 1095 Textless  Wood  Variant.jpg
| Image6Text          = Textless Ashley Wood Variant
| Image7              = 
| Image7Text          = 
| Image8              = 
| Image8Text          = 
| Volume              = 1
| Issue               = 1095
| Day                 = 19
| Month               = 5
| Year                = 2025
| Rating              = T
| Event               = All In

| Executive Editor    = Marie Javins
| CoverArtist1        = Mikel Janín
| Cover2Artist1       = Bruno Redondo
| Cover3Artist1       =  Jason Shawn Alexander 
| Cover4Artist1       =  John Giang 
| Cover5Artist1       = Ashley Wood 
| Cover6Artist1       =  

| Writer1_1           = Tom Taylor
| Penciler1_1         = Mikel Janín
| Inker1_1            = Mikel Janín
| Colorist1_1         = Mikel Janín
| Letterer1_1         = Wes Abbott
| Editor1_1           = Jessica Berbey
| Editor1_2           = Ben Meares
| Editor1_3           = Rob Levin

| Quotation           = [[Batman|What you do]] is harder than vengeance because [[Batman (Bruce Wayne)|you]] also have to live with the consequences of your mercy.
| Speaker             = [[Leslie Thompkins (Prime Earth)|Dr. Leslie Thompkins]]

| StoryTitle1         = Mercy of the Father, Part Six
| Synopsis1           = 

| Appearing1          = 
'''Featured Characters:'''
* {{a|[[Bruce Wayne (Prime Earth)|Batman (Bruce Wayne)]]}} {{Visionalso}}
'''Supporting Characters:'''
* {{a|[[Leslie Thompkins (Prime Earth)|Dr. Leslie Thompkins]]}}
* {{a|[[Barbara Gordon (Prime Earth)|Oracle (Barbara Gordon)]]}} {{Voice}}
* {{a|[[Kal-El (Prime Earth)|Superman (Clark Kent)]]}} 
'''Antagonists'''
* {{a|[[Evelyn Scott (Prime Earth)|Asema]]}}
* {{a|[[Elixir (organization)|Elixir]]}} {{Unnamed}}
** Ambrose {{1stUnnamed}}
* {{a|[[Gotham City Police Department]]}}
** {{a|[[Vandal Savage (Prime Earth)|Commissioner Vandal Savage]]}}
* {{a|[[Joseph Chilton (Prime Earth)|Joe Chill (Joseph Chilton)]]}} {{Visionalso}} 
* {{a|[[Oswald Cobblepot (Prime Earth)|The Penguin]]}}
** Penguin's Gang
'''Other Characters:'''
* [[Evelyn Scott (Prime Earth)|"Dr. Forster"]]
* {{a|[[Scarlett Scott (Prime Earth)|Scarlett Scott]]}}
* [[Evelyn Scott (Prime Earth)|Evelyn Scott]] {{Mentioned}}
* [[Wayne Family]] {{Deceased}}
** [[Martha Kane (Prime Earth)|Martha Wayne]] {{Mentioned}}
** [[Thomas Wayne (Prime Earth)|Thomas Wayne]] {{Mentioned}}
'''Locations:'''
* {{a|[[Prime Earth|Earth 0]]}}
** {{a|[[United States of America]]}}
*** {{a|[[Gotham City]]}}
**** {{a|[[Iceberg Lounge]]}}
**** Joe Chill's Apartment
**** {{a|[[Pennyworth Manor]]}}
***** {{a|[[Batcave]]}}
**** [[Elixir (organization)|Theromise Health Industries]]
**** Faultless Juveline Center {{Mentioned}}
**** [[Thompkins Clinic]] {{Mentioned}}
*** [[Metropolis]] {{Mentioned}}
**** [[Daily Planet]] {{Mentioned}}
'''Items:'''
* {{a|[[Batsuit]]s}}
** {{a|[[Batrope]]}}
** {{a|[[Utility Belt]]}}
* {{a|[[Joe Chill's Gun]]}} 
* {{a|[[Penguin's Umbrella]]}}
* Sangraal (drug) {{Mentioned}}
'''Vehicles:'''
* {{a|[[Batmobile]]}}

| Notes               =
| Trivia              =
| Recommended         = {{Batman RR}}
| Links               = 
}}`,
            },
            sha1: { _text: "0bzvxzxh50llmaic654wh4zek96m60p" },
          },
        },
        {
          title: { _text: "Detective Comics Vol 1 1096" },
          ns: { _text: "0" },
          id: { _text: "784515" },
          revision: {
            id: { _text: "3812436" },
            parentid: { _text: "3765769" },
            timestamp: { _text: "2025-09-01T15:15:16Z" },
            contributor: {
              username: { _text: "Cmanigold" },
              id: { _text: "36766115" },
            },
            origin: { _text: "3812436" },
            model: { _text: "wikitext" },
            format: { _text: "text/x-wiki" },
            text: {
              _attributes: {
                bytes: "4229",
                sha1: "6i2vifn2iftbd0eyoyifdvqhrolnqci",
                "xml:space": "preserve",
              },
              _text: `{{DC Database:Comic Template
| Title               = Detective Comics
| Image               = Detective Comics Vol 1 1096.jpg
| Image2              = Detective Comics Vol 1 1096 Textless.jpg
| Image4              = Detective Comics Vol 1 1096 Textless Variant.jpg
| Image4Text          = Textless Variant
| Image5              = Detective Comics Vol 1 1096 Textless Chew Variant.jpg
| Image5Text          = Textless 1:25 Variant
| Image6              = Detective Comics Vol 1 1096 Textless  Wood  Variant.jpg
| Image6Text          = Textless Ashley Wood Variant
| Image7              = 
| Image7Text          = 
| Image8              = 
| Image8Text          = 
| Volume              = 1
| Issue               = 1096
| Day                 = 16
| Month               = 6
| Year                = 2025
| Rating              = T
| Event               = All In

| Executive Editor    = Marie Javins
| CoverArtist1        = Mikel Janín
| Cover2Artist1       = Bruno Redondo
| Cover3Artist1       = Derrick Chew
| Cover4Artist1       = Ashley Wood
| Cover5Artist1       =  
| Cover6Artist1       =  

| Writer1_1           = Tom Taylor
| Penciler1_1         = Mikel Janín
| Inker1_1            = Mikel Janín
| Inker1_2            = Norm Rapmund
| Colorist1_1         = Mikel Janín
| Letterer1_1         = Wes Abbott
| Editor1_1           = Jessica Berbey
| Editor1_2           = Ben Meares
| Editor1_3           = Rob Levin

| Quotation           = It would be so easy. To let him keep bleeding, to hear his last breath escape his lips. To let the hate in my heart win. You didn't [[Martha Kane (Prime Earth)|them]] away, [[Joseph Chilton (Prime Earth)|Chill]]. [[Thomas Wayne (Prime Earth)|They're]] still here.
| Speaker             = [[Bruce Wayne (Prime Earth)|Batman (Bruce Wayne)]]

| StoryTitle1         = Mercy of the Father, Finale
| Synopsis1           = 

| Appearing1          = 
'''Featured Characters:'''
* {{a|[[Bruce Wayne (Prime Earth)|Batman (Bruce Wayne)]]}} 
'''Supporting Characters:'''
* {{a|[[Batman Family|Bat-Family]]}}
** {{a|[[Barbara Gordon (Prime Earth)|Batgirl/Oracle (Barbara Gordon)]]}} 
** {{a|[[Stephanie Brown (Prime Earth)|Batgirl (Stephanie Brown)]]}} 
** {{a|[[Jason Todd (Prime Earth)|Red Hood (Jason Todd)]]}} 
** {{a|[[Damian Wayne (Prime Earth)|Robin (Damian Wayne)]]}}
** {{a|[[Timothy Drake (Prime Earth)|Robin (Tim Drake)]]}} 
** {{a|[[Duke Thomas (Prime Earth)|The Signal (Duke Thomas)]]}} 
* {{a|[[Scarlett Scott (Prime Earth)|Scarlett Scott]]}}
* {{a|[[Thomas Wayne (Prime Earth)|Thomas Wayne]]}} {{Deceased}} {{Flashback}} {{Cameo}}
'''Antagonists'''
* {{a|[[Evelyn Scott (Prime Earth)|Asema (Evelyn Scott)]]}} {{Green|Real identity revealed}} {{Green|Impersonates Dr. Bridget Forster}}
* {{a|[[Elixir (organization)|Elixir]]}} {{Green|Full name revealed}}
** Ambrose {{Green|Real name revealed}} {{1stFull}}
* {{a|[[Joseph Chilton (Prime Earth)|Joe Chill]]}} 
* Theromise Health employees
* Warden Slattery
'''Other Characters:'''
* {{a|[[Gotham City Police Department]]}}
* Dr. Bridget Forster {{Green|Full name revealed}} {{Deceased}} {{Mentioned}}
* [[Wayne Enterprises]]
* [[Wayne Family]] {{Deceased}}
** [[Martha Kane (Prime Earth)|Martha Wayne]] {{Mentioned}}
'''Locations:'''
* {{a|[[Prime Earth|Earth 0]]}}
** {{a|[[United States of America]]}}
*** {{a|[[Gotham City]]}} {{Flashalso}}
**** {{a|[[Blackgate Penitentiary]]}} {{Unnamed}}
**** Faultless Juvenile Center
**** {{a|[[Gotham Clock Tower]]}}
**** {{a|[[Gotham General Hospital]]}} {{Unnamed}}
**** [[Theromise Health Industries]] {{Destroyed}}
'''Items:'''
* {{a|[[Batsuit]]s}}
** {{a|[[Batrope]]}}
** {{a|[[Utility Belt]]}}
* Sangraal (drug)
'''Vehicles:'''
* {{a|[[Batcycle]]s}}
* [[Robin's Motorcycle|Red Hood's Motorcycle]]
* {{a|[[Robin's Motorcycle]]s}}
* [[Robin's Motorcycle|The Signal's Motorcycle]]

| Notes               =
* Batman's story chronologically continues in the ''[[Batman and Robin: Memento|Memento]]'' and ''[[Batman and Robin: The Gotham Cycle|The Gotham Cycle]]'' storylines,<ref>[[Batman and Robin Vol 3 19|Notes from ''Batman and Robin #19'']]</ref> which begin in {{c|Batman and Robin Vol 3 14}}.
| Trivia              =
| Recommended         = {{Batman RR}}
| Links               = 
}}`,
            },
            sha1: { _text: "6i2vifn2iftbd0eyoyifdvqhrolnqci" },
          },
        },
      ],
    },
  };

  assert(isEqual(list, expected));
});

test("Eats comments", (_t) => {
  const template = "{{Name|Key= Hello World<!-- this should be ignored-->!}}";
  const parsed = new TemplateParser(template).parse(true);
  const res = parsed.get("Key").unwrap();

  return assert(isEqual(res, "Hello World!"));
});

test("Parse Comic Template w/ Pubday only", (_t) => {
  let template = `{{DC Database:Comic Template
| OneShot             = Justice Society
| Title               = Last Days of the Justice Society Special
| Image               = Last Days of the Justice Society Special 1.jpg
| Volume              = 1
| Issue               = 1
| Month               = 1
| Year                = 1986
| Pubday              = 24
| Pubmonth            = 4
| Pubyear             = 1986

| Executive Editor    = Dick Giordano
| CoverArtist1        = David Ross 
| CoverArtist2        = Mike Gustovich

| Editor1_1           = Roy Thomas
| Writer1_1           = Roy Thomas
| Writer1_2           = Dann Thomas

| Penciler1_1         = Mike Gustovich
| Inker1_1            = David Ross
| Colorist1_1         = Carl Gafford
| Letterer1_1         = David Cody Weiss 

| Quotation           = [[Ragnarok (event)|This]] is an [[Time Loop|eternal]] battle, [[Sylvester Pemberton (New Earth)|my young friend]]... a struggle thatcan never really be finished-- never really be won. 
| Speaker             = [[Kent Nelson (New Earth)|Doctor Fate (Kent Nelson)]]

| StoryTitle1         = Last Days of the Justice Society
| Synopsis1           = 
| Appearing1          = 
| Notes               = 
| Trivia              = 
}}`;

  const parsed = new TemplateParser(template).parse(true);

  const res = parsed.get("Day").unwrap_or(parsed.get("Pubday").unwrap_or(""));

  return assert(isEqual(res, "24"));
});

test("Parse Comic Title in Template", (_t) => {
  let template = `{{DC Database:Comic Template
| OneShot             = Justice Society
| Title               = Last Days of the Justice Society Special
| Image               = Last Days of the Justice Society Special 1.jpg
| Volume              = 1
| Issue               = 1
| Month               = 1
| Year                = 1986
| Pubday              = 24
| Pubmonth            = 4
| Pubyear             = 1986

| Executive Editor    = Dick Giordano
| CoverArtist1        = David Ross 
| CoverArtist2        = Mike Gustovich

| Editor1_1           = Roy Thomas
| Writer1_1           = Roy Thomas
| Writer1_2           = Dann Thomas

| Penciler1_1         = Mike Gustovich
| Inker1_1            = David Ross
| Colorist1_1         = Carl Gafford
| Letterer1_1         = David Cody Weiss 

| Quotation           = [[Ragnarok (event)|This]] is an [[Time Loop|eternal]] battle, [[Sylvester Pemberton (New Earth)|my young friend]]... a struggle thatcan never really be finished-- never really be won. 
| Speaker             = [[Kent Nelson (New Earth)|Doctor Fate (Kent Nelson)]]

| StoryTitle1         = Last Days of the Justice Society
| Synopsis1           = 
| Appearing1          = 
| Notes               = 
| Trivia              = 
}}`;

  const parsed = new TemplateParser(template).parse(true);
  const res = parsed.get("Title").unwrap();

  return assert(isEqual(res, "Last Days of the Justice Society Special"));
});
