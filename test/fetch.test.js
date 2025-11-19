import test from "node:test";
import { getAppearances, getRealitiesList } from "core/fetch";
import assert from "node:assert";
import { isEqual } from "lodash-es";
import fs from "fs";
import path from "node:path";

// TODO: Make this a real test but pick a smaller pull between 50 and 100?
// Might need to find some way to specify the revison otherwise testing will not work
test("Fetch Appearence Data", async (_t) => {
  const appearences = await getAppearances("Scarlett Scott (Prime Earth)");

  console.log(appearences);
  return true;
});

// test("Fetch & Clean Worlds", async (_t) => {
//   const res = await getRealitiesList();
//   // Make a file to check against
//   // console.log(res.length);
//   // fs.writeFileSync(process.cwd() + "worlds", res);
//   // fetch("https://dc.fandom.com/wiki/Special:Export/", {
//   //   method: "POST",
//   //   headers: {
//   //     "Content-Type": "application/x-www-form-urlencoded",
//   //   },
//   //   body: new URLSearchParams({
//   //     catname: "realities", // replace with the category name
//   //     addcat: "Add",
//   //   }),
//   //   credentials: "include", // include cookies (needed for logged-in requests)
//   // })
//   //   .then((response) => response.text())
//   //   .then((html) => {
//   //     console.log(process.cwd());
//   //     fs.writeFileSync(
//   //       "C:/Users/jamar/Documents/Hobbies/Coding/publication_date_sort/test/world get res.txt",
//   //       html
//   //     );
//   //   })
//   //   .catch((err) => console.error("Error:", err));
// });
