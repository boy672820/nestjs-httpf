import { Inject, Injectable } from '@nestjs/common';
import { Got, OptionsOfJSONResponseBody, Response } from 'got';
import { GOT } from './httpf.constants';
import { HttpfAsyncIterable } from './httpf-async-iterable.interface';
import { createHttpfAsyncIterable } from './create-httpf-async-iterable';

@Injectable()
export class HttpfService {
  constructor(@Inject(GOT) protected readonly httpClient: Got) {}

  get<T>(
    url: string | URL,
    options?: OptionsOfJSONResponseBody,
  ): HttpfAsyncIterable<Response<T>> {
    const httpClient = this.httpClient;
    return createHttpfAsyncIterable<Response<T>>(
      (async function* () {
        yield await httpClient.get<T>(url, {
          responseType: 'json',
          ...options,
        });
      })(),
    );
  }

  post<T>(
    url: string | URL,
    options?: OptionsOfJSONResponseBody,
  ): HttpfAsyncIterable<Response<T>> {
    const httpClient = this.httpClient;
    return createHttpfAsyncIterable<Response<T>>(
      (async function* () {
        yield await httpClient.post<T>(url, {
          responseType: 'json',
          ...options,
        });
      })(),
    );
  }

  patch<T>(
    url: string | URL,
    options?: OptionsOfJSONResponseBody,
  ): HttpfAsyncIterable<Response<T>> {
    const httpClient = this.httpClient;
    return createHttpfAsyncIterable<Response<T>>(
      (async function* () {
        yield await httpClient.patch<T>(url, {
          responseType: 'json',
          ...options,
        });
      })(),
    );
  }

  put<T>(
    url: string | URL,
    options?: OptionsOfJSONResponseBody,
  ): HttpfAsyncIterable<Response<T>> {
    const httpClient = this.httpClient;
    return createHttpfAsyncIterable<Response<T>>(
      (async function* () {
        yield await httpClient.put<T>(url, {
          responseType: 'json',
          ...options,
        });
      })(),
    );
  }

  delete<T>(
    url: string | URL,
    options?: OptionsOfJSONResponseBody,
  ): HttpfAsyncIterable<Response<T>> {
    const httpClient = this.httpClient;
    return createHttpfAsyncIterable<Response<T>>(
      (async function* () {
        yield await httpClient.delete<T>(url, {
          responseType: 'json',
          ...options,
        });
      })(),
    );
  }

  head<T>(
    url: string | URL,
    options?: OptionsOfJSONResponseBody,
  ): HttpfAsyncIterable<Response<T>> {
    const httpClient = this.httpClient;
    return createHttpfAsyncIterable<Response<T>>(
      (async function* () {
        yield await httpClient.head<T>(url, options);
      })(),
    );
  }
}

export { HttpfAsyncIterable, createHttpfAsyncIterable };
