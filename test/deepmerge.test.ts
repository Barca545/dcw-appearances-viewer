import test from "node:test";
import deepmerge from "../src/main/deepmerge";
import assert from "node:assert";
import { isEqual } from "lodash-es";

test("Merge basic objects", (_t) => {
  const a = { foo: "1" };
  const b = { bar: 3 };
  const res = deepmerge(a, b);
  const expected = { foo: "1", bar: 3 };
  return assert(isEqual(res, expected));
});

test("Merge objects - shared field has different types ", (_t) => {});

test("Merge objects w/ nested fields - nested fields same keys", (_t) => {
  const a = { foo: { bar: 13 } };
  const b = { foo: { bar: 14 } };
  const res = deepmerge(a, b);
  const expected = { foo: { bar: 13 } };
  return assert(isEqual(res, expected));
});

test("Merge objects w/ nested fields - nested fields different keys", (_t) => {
  const a = { foo: { bar: 13 } };
  const b = { foo: { baz: "baz" } };
  const res = deepmerge(a, b);
  const expected = { foo: { baz: "baz" } };
  return assert(isEqual(res, expected));
});

test("Merge objects w/ nested fields - target has flat field", (_t) => {
  const a = { foo: 13 };
  const b = { foo: { baz: "baz" } };
  const res = deepmerge(a, b);
  const expected = { foo: { baz: "baz" } };
  return assert(isEqual(res, expected));
});

test("Merge objects w/ nested fields - incoming has flat field", (_t) => {
  const a = { foo: { bar: 13 } };
  const b = { foo: "foo" };
  const res = deepmerge(a, b);
  const expected = { foo: "foo" };
  return assert(isEqual(res, expected));
});
