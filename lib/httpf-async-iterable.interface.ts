import { FxAsyncIterable } from './fx-async-iterable.interface';

export interface HttpfAsyncIterable<T> extends FxAsyncIterable<T> {
  catchError<E>(handler: (error: unknown) => E): HttpfAsyncIterable<T | E>;
  retry(retries: number): HttpfAsyncIterable<T>;
  mergeMap<U>(mapper: (value: T) => Iterable<U>): HttpfAsyncIterable<U>;
}
