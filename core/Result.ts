export interface ResultInterface<T> {
  is_ok(): boolean;

  unwrap(): T;

  /**Unwraps the error inside a `Result`. Panics if the `Result` is `Ok`. */
  unwrapp_err(): Error;

  unwrap_or(fallback: T): T;
}

export class Ok<T> implements ResultInterface<T> {
  private data: T;

  constructor(data: T) {
    this.data = data;
  }
  unwrap_or(_: T): T {
    return this.data;
  }

  unwrap(): T {
    return this.data;
  }

  is_ok(): true {
    return true;
  }

  unwrapp_err(): Error {
    throw new Error("Called `unwrap_err` on `Ok`.");
  }
}

export class Err<T> implements ResultInterface<T> {
  error: Error;

  constructor(error: Error) {
    this.error = error;
  }
  unwrap_or(fallback: T): T {
    return fallback;
  }

  is_ok(): boolean {
    return false;
  }
  unwrap(): T {
    throw this.error;
  }

  unwrapp_err(): Error {
    return this.error;
  }
}

export type Result<T> = Ok<T> | Err<T>;
