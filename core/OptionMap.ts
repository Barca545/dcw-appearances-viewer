import { None, Some, Option } from "./option";

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
