import { fx } from '@fxts/core';

export type FxAsyncIterable<T> = ReturnType<typeof fx<AsyncIterable<T>>>;
