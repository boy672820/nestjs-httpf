# nestjs-httpf

> Functional-style HTTP client for NestJS

[![npm version](https://img.shields.io/npm/v/nestjs-httpf.svg)](https://www.npmjs.com/package/nestjs-httpf)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Functional Style**: Handle complex API requests safely and declaratively
- **Language-Friendly**: Promise-based instead of Observable, enabling direct use of async/await
- **AsyncIterable-Based**: Leverages FxTS's [AsyncIterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols) for efficient data processing through lazy evaluation and function composition
- **Retry Support**: Automatically retry failed requests
- **Error Handling**: Use `catchError` to treat errors as values instead of try-catch
- **FxTS Integration**: Access various helper functions from the [FxTS](https://fxts.dev/) library
- **Got-Based**: Uses the powerful and reliable [Got](https://github.com/sindresorhus/got) HTTP client

## Background

NestJS's built-in HTTP module provides an excellent way to safely handle complex API processing by applying RxJS's reactive programming. However, since it returns RxJS Observable objects, you need to extract values through operators like `firstValueFrom`, which can be cumbersome.

**nestjs-httpf** solves this inconvenience and allows you to handle asynchronous operations in a more language-friendly way:

- ✅ Directly work with Promises, enabling `await` usage
- ✅ Write asynchronous processing declaratively with functional style
- ✅ Compose functions with the FxTS library for various features

## Installation

```bash
npm install nestjs-httpf @fxts/core
```

or

```bash
yarn add nestjs-httpf @fxts/core
```

or

```bash
pnpm add nestjs-httpf @fxts/core
```

## Quick Start

### 1. Register the Module

```typescript
import { Module } from '@nestjs/common';
import { HttpfModule } from 'nestjs-httpf';

@Module({
  imports: [HttpfModule],
})
export class AppModule {}
```

### 2. Use in a Service

```typescript
import { Injectable } from '@nestjs/common';
import { HttpfService } from 'nestjs-httpf';

@Injectable()
export class UserService {
  constructor(private readonly httpfService: HttpfService) {}

  async getUser(id: string) {
    const user = await this.httpfService
      .get<User>(`https://api.example.com/users/${id}`)
      .map((response) => response.body)
      .head();

    return user;
  }
}
```

## Usage Examples

### Basic HTTP Requests

```typescript
// GET request
const data = await this.httpfService
  .get<{ message: string }>('https://api.example.com/hello')
  .map((response) => response.body)
  .head();

// POST request
const result = await this.httpfService
  .post<{ id: string }>('https://api.example.com/users', {
    json: { name: 'John', email: 'john@example.com' },
  })
  .map((response) => response.body)
  .head();

// PUT request
await this.httpfService
  .put('https://api.example.com/users/123', {
    json: { name: 'Jane' },
  })
  .head();

// PATCH request
await this.httpfService
  .patch('https://api.example.com/users/123', {
    json: { email: 'jane@example.com' },
  })
  .head();

// DELETE request
await this.httpfService.delete('https://api.example.com/users/123').head();
```

### Error Handling

Use `catchError` to treat errors as values:

```typescript
const result = await this.httpfService
  .get<User>('https://api.example.com/users/123')
  .catchError((error) => ({
    body: null,
    statusCode: 500,
    error: error.message,
  }))
  .map((response) => response.body)
  .head();

// Transform and handle errors
const user = await this.httpfService
  .get<User>('https://api.example.com/users/123')
  .catchError((error) => {
    console.error('Failed to fetch user:', error);
    return { body: { id: '0', name: 'Unknown' } };
  })
  .map((response) => response.body)
  .head();
```

### Retry

Automatically retry failed requests:

```typescript
// Retry up to 3 times
const data = await this.httpfService
  .get<Data>('https://api.example.com/unstable-endpoint')
  .retry(3)
  .map((response) => response.body)
  .head();

// Using retry with catchError
const result = await this.httpfService
  .get<Data>('https://api.example.com/data')
  .retry(2)
  .catchError((error) => ({
    body: { fallback: true },
    statusCode: 200,
  }))
  .map((response) => response.body)
  .head();
```

### Using FxTS Methods

You can use various helper functions from FxTS:

```typescript
// filter: Process only responses that match conditions
const successResponse = await this.httpfService
  .get<Data>('https://api.example.com/data')
  .filter((response) => response.statusCode === 200)
  .map((response) => response.body)
  .head();

// take: Get only the first N items
const items = await this.httpfService
  .get<Item[]>('https://api.example.com/items')
  .map((response) => response.body)
  .take(5)
  .toArray();

// Complex chaining
const processedData = await this.httpfService
  .get<RawData>('https://api.example.com/data')
  .retry(2)
  .catchError(() => ({ body: [] }))
  .filter((response) => response.statusCode === 200)
  .map((response) => response.body)
  .map((data) => data.map((item) => ({ ...item, processed: true })))
  .head();
```

### Flattening Data with mergeMap

```typescript
const allItems = await this.httpfService
  .get<{ items: Item[] }>('https://api.example.com/data')
  .map((response) => response.body)
  .mergeMap((data) => data.items)
  .toArray();
```

## Advanced Configuration

### Global Configuration

```typescript
import { Module } from '@nestjs/common';
import { HttpfModule } from 'nestjs-httpf';

@Module({
  imports: [
    HttpfModule.register({
      global: true,
      timeout: 5000,
      retry: {
        limit: 2,
      },
      headers: {
        'User-Agent': 'my-app/1.0.0',
      },
    }),
  ],
})
export class AppModule {}
```

### Async Configuration

```typescript
import { Module } from '@nestjs/common';
import { HttpfModule } from 'nestjs-httpf';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpfModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('HTTP_TIMEOUT'),
        headers: {
          'API-Key': configService.get('API_KEY'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Configuration with useClass

```typescript
import { Injectable } from '@nestjs/common';
import { HttpfModuleOptionsFactory, HttpfModuleOptions } from 'nestjs-httpf';

@Injectable()
class HttpConfigService implements HttpfModuleOptionsFactory {
  createHttpOptions(): HttpfModuleOptions {
    return {
      timeout: 5000,
      retry: {
        limit: 3,
      },
    };
  }
}

@Module({
  imports: [
    HttpfModule.registerAsync({
      useClass: HttpConfigService,
    }),
  ],
})
export class AppModule {}
```

## API Reference

### HttpfService

#### Methods

- `get<T>(url: string | URL, options?: OptionsOfJSONResponseBody): HttpfAsyncIterable<Response<T>>`
- `post<T>(url: string | URL, options?: OptionsOfJSONResponseBody): HttpfAsyncIterable<Response<T>>`
- `put<T>(url: string | URL, options?: OptionsOfJSONResponseBody): HttpfAsyncIterable<Response<T>>`
- `patch<T>(url: string | URL, options?: OptionsOfJSONResponseBody): HttpfAsyncIterable<Response<T>>`
- `delete<T>(url: string | URL, options?: OptionsOfJSONResponseBody): HttpfAsyncIterable<Response<T>>`
- `head<T>(url: string | URL, options?: OptionsOfJSONResponseBody): HttpfAsyncIterable<Response<T>>`

### HttpfAsyncIterable

`HttpfAsyncIterable` provides all FxTS methods along with the following additional methods:

#### Additional Methods

- `catchError<E>(handler: (error: unknown) => E): HttpfAsyncIterable<T | E>` - Catch errors and return a fallback value
- `retry(retries: number): HttpfAsyncIterable<T>` - Retry the specified number of times on failure
- `mergeMap<U>(mapper: (value: T) => Iterable<U>): HttpfAsyncIterable<U>` - Flatten values

#### FxTS Methods and Helper Functions

See the [FxTS documentation](https://fxts.dev/docs/index) for more information.

## License

[MIT](LICENSE)

## Contributing

Issues and pull requests are always welcome!

## Related Projects

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Got](https://github.com/sindresorhus/got) - Human-friendly and powerful HTTP request library
- [FxTS](https://fxts.dev/) - Functional library for TypeScript/JavaScript
