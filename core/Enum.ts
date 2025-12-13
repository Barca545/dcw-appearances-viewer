type Enum<T extends Record<string, unknown>> = { [K in keyof T]: { tag: K; value: T[K] } }[keyof T];

// export function match<T extends Record<string, unknown>, R>(value: Enum<T>, cases: { [K in keyof T]: (value: T[K]) => R }): R {
//   return cases[value.tag](value.value);
// }

function createEnum<T extends Record<string, unknown>>() {
  return {
    // match: <R>(value: Enum<T>, cases: { [K in keyof T]: (value: T[K]) => R }): R => {
    //   return cases[value.tag](value.value);
    // },
    match<R>(
      value: Enum<T>,
      cases: { [K in keyof T]: (value: T[K]) => R } | (Partial<{ [K in keyof T]: (value: T[K]) => R }> & { _: () => R }),
    ) {},

    create: <K extends keyof T>(tag: K, value: T[K]): Enum<T> => {
      return { tag, value } as Enum<T>;
    },

    matchWith: <R>(value: Enum<T>, cases: Partial<{ [K in keyof T]: (value: T[K]) => R }> & { _: () => R }): R => {
      const handler = cases[value.tag];
      return handler ? handler(value.value as any) : cases._();
    },
  };
}

/** # Unimplemented.
 * Marks a type as missing some properties.
 */
// TODO: This probably needs to be some combo of Partial and a union type with `Exclude`s
type Incomplete = {};

const MyEnum = createEnum<{ App: string; Start: number }>();

const foo = MyEnum.create("App", "foo");

MyEnum.matchWith(foo, { App: (s) => {}, _: (v) => {} });
