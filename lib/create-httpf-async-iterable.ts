import { fx } from '@fxts/core';
import { FxAsyncIterable } from './fx-async-iterable.interface';
import { HttpfAsyncIterable } from './httpf-async-iterable.interface';

/**
 * Wraps an AsyncIterable as an HttpfAsyncIterable.
 * All methods from FxAsyncIterable are available, plus additional
 * catchError, retry, and mergeMap methods.
 */
export function createHttpfAsyncIterable<T>(
  source: AsyncIterable<T>,
): HttpfAsyncIterable<T> {
  const fxIterable = fx(source);

  const handler: ProxyHandler<FxAsyncIterable<T>> = {
    get(target, prop, receiver) {
      if (prop === 'catchError') {
        return function <E>(
          errorHandler: (error: unknown) => E,
        ): HttpfAsyncIterable<T | E> {
          const catchError = (async function* () {
            try {
              for await (const value of source) {
                yield value;
              }
            } catch (error) {
              yield errorHandler(error);
            }
          })();
          return createHttpfAsyncIterable<T | E>(catchError);
        };
      }

      if (prop === 'retry') {
        return function (retries: number): HttpfAsyncIterable<T> {
          const retry = (async function* () {
            let attempt = 0;
            let lastError: unknown;
            while (attempt <= retries) {
              try {
                for await (const value of source) {
                  yield value;
                }
                return;
              } catch (error) {
                lastError = error;
                attempt++;
              }
            }
            throw lastError;
          })();
          return createHttpfAsyncIterable<T>(retry);
        };
      }

      if (prop === 'mergeMap') {
        return function <U>(
          mapper: (value: T) => Iterable<U>,
        ): HttpfAsyncIterable<U> {
          const mergeMap = (async function* () {
            for await (const value of source) {
              for (const innerValue of mapper(value)) {
                yield innerValue;
              }
            }
          })();
          return createHttpfAsyncIterable<U>(mergeMap);
        };
      }

      const value: unknown = Reflect.get(target, prop, receiver);

      // If it's a method and returns FxAsyncIterable, wrap it as HttpfAsyncIterable
      if (typeof value === 'function') {
        return function (this: unknown, ...args: unknown[]): unknown {
          const result: unknown = (
            value as (...args: unknown[]) => unknown
          ).apply(target, args);

          // Wrap methods that return FxAsyncIterable as HttpfAsyncIterable
          if (
            result &&
            typeof result === 'object' &&
            Symbol.asyncIterator in result &&
            typeof (result as FxAsyncIterable<unknown>).map === 'function'
          ) {
            return createHttpfAsyncIterable(result as AsyncIterable<unknown>);
          }

          return result;
        };
      }

      return value;
    },
  };

  return new Proxy(fxIterable, handler) as HttpfAsyncIterable<T>;
}
