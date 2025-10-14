import { test } from "node:test";
import { Peekable } from "../iter";
import { isEqual } from "lodash-es";

test("Clone Iter", (_t) => {
  const source = "Hello World";
  let iter = new Peekable([...source]);

  iter.next();
  iter.next();
  iter.next();
  iter.next();
  const test1 = iter.next().value;

  if (!isEqual(test1, "o")) {
    throw Error(
      `Iter index ${iter.index()} was expected to be "o" but was ${test1}.`
    );
  }

  let new_iter = iter.clone();
  new_iter.next();

  const test2 = new_iter.next().value;
  if (!isEqual(new_iter.index(), iter.index() + 2)) {
    throw Error(`Iter index was expected to be 6 but was ${iter.index()}.`);
  }

  if (!isEqual(test2, "W")) {
    throw Error(
      `Iter index ${iter.index()} was expected to be "W" but was ${test2}.`
    );
  }

  return true;
});
