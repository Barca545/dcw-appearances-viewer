export class Some<T> implements OptionInterface<T> {
  toString?: never;

  private value: T;

  constructor(val: T) {
    this.value = val;
  }
  isNone(): boolean {
    return false;
  }

  unwrap(): T {
    return this.value;
  }

  unwrap_or(_: T): T {
    return this.value;
  }

  unwrap_or_else(_: () => T): T {
    return this.value;
  }

  isSome(): boolean {
    return true;
  }

  dbg(): string {
    return `Some(${this.value})`;
  }
}

export class None<T> implements OptionInterface<T> {
  toString?: never;

  isNone(): boolean {
    return true;
  }
  unwrap(): never {
    throw new Error(`Tried to unwrap option None`);
  }

  unwrap_or(fallback: T): T {
    return fallback;
  }

  unwrap_or_else(f: () => T): T {
    return f();
  }

  isSome(): boolean {
    return false;
  }

  dbg(): string {
    return `None`;
  }
}

interface OptionInterface<T> {
  toString?: never;

  /**Returns the value contained inside the Option. Panics if the option is None. */
  unwrap(): T | never;

  /**Returns true if the Option is Some T */
  isSome(): boolean;

  /**Returns true if the Option is None T */
  isNone(): boolean;

  unwrap_or(fallback: T): T;

  unwrap_or_else(f: () => T): T;

  dbg(): string;

  // /**Takes the value from an Option leaving a None in it's place. */
  // take(): Option<T>;
}

// Should option be an intereface or class not type
export type Option<T> = Some<T> | None<T>;

export function match<T, R>(option: Option<T>, some: (val: T) => R, none: () => R): R {
  if (option instanceof Some) {
    return some(option.unwrap());
  } else {
    return none();
  }
}
