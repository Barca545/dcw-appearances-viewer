import test from "node:test";
import { getAppearances, getAppearancePages, getRealitiesList } from "../fetch";
import assert from "node:assert";
import { isEqual } from "lodash-es";
import fs from "fs";
import path from "node:path";

// test("Fetch appearance names", async (_t) => {
//   // Lets test against a pre-crisis character *and* grab the rev number just in case I need to
//   let res = await getAppearances("Robert Hobb (Earth-One)");

//   let expected = [
//     "Superboy Vol 1 6",
//     "Superboy Vol 1 7",
//     "Superboy Vol 1 8",
//     "Superboy Vol 1 9",
//     "Superboy Vol 1 11",
//     "Superboy Vol 2 24",
//   ];

//   return assert(isEqual(res, expected));
// });

// test("Fetch appearance pages", async (_t) => {
//   // Using Robbert Hobb (Earth-One) because it is unlikely to change
//   let req = [
//     "Superboy Vol 1 7",
//     "Superboy Vol 1 8",
//     "Superboy Vol 1 9",
//     "Superboy Vol 1 11",
//     "Superboy Vol 1 6",
//     "Superboy Vol 2 24",
//   ];

//   let res = await getAppearancePages(req);

//   // FIXME: Compare against current character page but this might fail if there are updates that make the saved xml file outdated
//   // TODO: Find a way to grab specific revisions
// let expected = fs.readFileSync(
//     process.cwd() + "/test/Robert Hobb (Earth-One) Appearances.xml",
//     "utf-8"
//   );

//   return assert(isEqual(res, expected));
// });

test("Fetch & Clean Worlds", async (_t) => {
  const res = await getRealitiesList();
  // Make a file to check against
  // console.log(res.length);
  // fs.writeFileSync(process.cwd() + "worlds", res);
  // fetch("https://dc.fandom.com/wiki/Special:Export/", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/x-www-form-urlencoded",
  //   },
  //   body: new URLSearchParams({
  //     catname: "realities", // replace with the category name
  //     addcat: "Add",
  //   }),
  //   credentials: "include", // include cookies (needed for logged-in requests)
  // })
  //   .then((response) => response.text())
  //   .then((html) => {
  //     console.log(process.cwd());
  //     fs.writeFileSync(
  //       "C:/Users/jamar/Documents/Hobbies/Coding/publication_date_sort/test/world get res.txt",
  //       html
  //     );
  //   })
  //   .catch((err) => console.error("Error:", err));
});
