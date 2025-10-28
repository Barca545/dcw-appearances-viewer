export class Some<T> implements OptionInterface<T> {
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
}

export class None<T> implements OptionInterface<T> {
  isNone(): boolean {
    return true;
  }
  unwrap(): never {
    throw new Error(`Tried to unwrap option None`);
  }

  // FIXME: If I want correct typing here none needs to be typed
  unwrap_or(normal: T): T {
    return normal;
  }

  unwrap_or_else(f: () => T): T {
    return f();
  }

  isSome(): boolean {
    return false;
  }
}

interface OptionInterface<T> {
  /**Returns the value contained inside the Option. Panics if the option is None. */
  unwrap(): T | never;

  /**Returns true if the Option is Some T */
  isSome(): boolean;

  /**Returns true if the Option is None T */
  isNone(): boolean;

  unwrap_or(fallback: T): T;

  unwrap_or_else(f: () => T): T;

  // /**Takes the value from an Option leaving a None in it's place. */
  // take(): Option<T>;
}

// Should option be an intereface or class not type
export type Option<T> = Some<T> | None<T>;

export function match<T, R>(
  option: Option<T>,
  some: (val: T) => R,
  none: () => R
): R {
  if (option instanceof Some) {
    return some(option.unwrap());
  } else {
    return none();
  }
}
