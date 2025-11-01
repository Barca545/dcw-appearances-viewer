import { match, None, Option, Some } from "./option.js";
import { Clone } from "./coreTypes.js";

export class Peekable<T> implements Clone<Peekable<T>> {
  private src: T[];
  private iter: Iterator<T>;
  // This stores the result of calling the underlying iterators next method
  private peeked: Option<IteratorResult<T>>;
  private _index: number;

  constructor(iter: Iterable<T>) {
    this.src = Array.from(iter);
    this.iter = iter[Symbol.iterator]();
    this.peeked = new None();
    this._index = 0;
  }

  clone(): Peekable<T> {
    let out: Peekable<T> = new Peekable([]);

    out._index = 0;
    out.peeked = new None();
    out.iter = this.src[Symbol.iterator]();

    // Consume until the index is reached so state is replicated
    while (out._index != this._index) {
      out.next();
    }

    out.peeked = this.peeked;

    return out;
  }

  next(): IteratorResult<T> {
    // FIXME: I am not sure this is where I want to increment
    this._index += 1;
    if (this.peeked.isSome()) {
      const res = this.peeked.unwrap();
      // We're taking the peeked value so it's gone now
      // TODO: Give options a take method
      this.peeked = new None();
      return res;
    } else {
      return this.iter.next();
    }
  }

  peek(): Option<T> {
    return match(
      this.peeked,
      (res) => {
        if (res.value === undefined) {
          return new None();
        } else {
          return new Some(res.value);
        }
      },
      () => {
        const res = this.iter.next();
        this.peeked = new Some(res);
        return new Some(res.value);
      },
    );
  }

  index(): number {
    return this._index;
  }

  // This is basically into_iter() it returns the underlying iterator the struct contains
  [Symbol.iterator]() {
    return this;
  }
}
