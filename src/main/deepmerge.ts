// merges two objects. If fields conflict uses the a value
// returns the result of the merge does not modify in place

// TODO: If this is too unweildy can just use
// https://www.npmjs.com/package/deepmerge instead

type Interface = Record<string, any>;

// TODO: Eventual option to pick which is favored in conflicts
// TODO: It's not really a merge really what I want this to do is replace the fields of b with a values if those values exist

export default function deepmerge<A extends Interface, B extends Interface = A, C extends Interface = A & B>(a: A, b: B): C {
  // FIXME: I don't want to modify in place
  let result = JSON.parse(JSON.stringify(b));

  for (const [key, bValue] of Object.entries(b)) {
    let aValue;
    if (key in a) {
      aValue = a[key as keyof A] as any;
    } else {
      continue;
    }

    // Redundant here might be useful in a merge function that is actually trying to merge and not just replace
    // if (!a.hasOwnProperty(key)) {
    //   Object.defineProperty(result, key, { value: bValue, enumerable: true });
    // }
    // If the fields are not objects just replace b with a
    if (!(aValue instanceof Object) && !(bValue instanceof Object)) {
      // TODO: This should be a configurable option
      // If the types of the fields differ prefer b
      if (typeof aValue !== typeof bValue) {
        Object.defineProperty(result, key, { value: bValue, enumerable: true });
      }
      Object.defineProperty(result, key, { value: aValue, enumerable: true });
    }
    // If the field is an object its fields need to be evaluated recursively
    else if (aValue instanceof Object && bValue instanceof Object) {
      // Merge recursively
      // such that if a and b overlap a overwrites
      Object.defineProperty(result, key, { value: deepmerge(aValue, bValue), enumerable: true });
    }
  }

  return result as C;
}
