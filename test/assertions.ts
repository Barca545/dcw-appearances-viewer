import { isEqual } from "lodash-es";

function assert_eq<T>(a: T, b: T): Error | true {
  let t = isEqual(a, b);
  if (!t) {
    throw new Error(`Not equal:\n left:\n${a}\n right:\n${b}`);
  }
  return true;
}
