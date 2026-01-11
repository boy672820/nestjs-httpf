import { Test, TestingModule } from '@nestjs/testing';
import { HttpfModule, HttpfService } from '../../lib';
import * as nock from 'nock';

describe('Retry', () => {
  let moduleRef: TestingModule;
  let httpfService: HttpfService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [HttpfModule],
    }).compile();

    await moduleRef.init();

    httpfService = moduleRef.get(HttpfService);
  });

  afterEach(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  describe('GET /unstable-endpoint', () => {
    it('should succeed on first attempt without retrying', async () => {
      const baseUrl = 'http://localhost:3000';

      nock(baseUrl)
        .get('/stable')
        .reply(200, { message: 'Success on first try' });

      const body = await httpfService
        .get<{ message: string }>(`${baseUrl}/stable`)
        .retry(2)
        .map((response) => response.body)
        .head();

      expect(body).toEqual({ message: 'Success on first try' });
    });

    it('should not retry when retry count is 0', async () => {
      const baseUrl = 'http://localhost:3000';

      nock(baseUrl)
        .get('/no-retry')
        .reply(500, { error: 'Internal Server Error' });

      await expect(
        httpfService
          .get<{ message: string }>(`${baseUrl}/no-retry`)
          .retry(0) // 재시도 없음
          .map((response) => response.body)
          .head(),
      ).rejects.toThrow();
    });

    it('should work with other methods in chain', async () => {
      const baseUrl = 'http://localhost:3000';

      nock(baseUrl).get('/chain-test').reply(200, { value: 10 });

      const result = await httpfService
        .get<{ value: number }>(`${baseUrl}/chain-test`)
        .retry(1)
        .map((response) => response.body)
        .map((body) => body.value * 2)
        .head();

      expect(result).toBe(20);
    });

    it('should work with catchError to handle first attempt error', async () => {
      const baseUrl = 'http://localhost:3000';

      nock(baseUrl)
        .get('/catch-with-retry')
        .reply(500, { error: 'Internal Server Error' });

      const result = await httpfService
        .get<{ message: string }>(`${baseUrl}/catch-with-retry`)
        .retry(0) // 재시도 없음, 바로 실패
        .catchError(() => ({
          body: { message: 'Fallback after error' },
          statusCode: 200,
        }))
        .map((response) => response.body)
        .head();

      expect(result).toEqual({ message: 'Fallback after error' });
    });

    it('should return HttpfAsyncIterable from retry method', async () => {
      const baseUrl = 'http://localhost:3000';

      nock(baseUrl).get('/type-check').reply(200, { message: 'Type check' });

      const retryIterable = httpfService
        .get<{ message: string }>(`${baseUrl}/type-check`)
        .retry(2);

      expect(typeof retryIterable.map).toBe('function');
      expect(typeof retryIterable.filter).toBe('function');
      expect(typeof retryIterable.catchError).toBe('function');
      expect(typeof retryIterable.retry).toBe('function');
      expect(typeof retryIterable.head).toBe('function');

      const body = await retryIterable.map((response) => response.body).head();
      expect(body).toEqual({ message: 'Type check' });
    });

    it('should work with filter after retry', async () => {
      const baseUrl = 'http://localhost:3000';

      nock(baseUrl).get('/filter-test').reply(200, { value: 10 });

      const result = await httpfService
        .get<{ value: number }>(`${baseUrl}/filter-test`)
        .retry(1)
        .filter((response) => response.statusCode === 200)
        .map((response) => response.body.value)
        .head();

      expect(result).toBe(10);
    });

    it('should allow chaining multiple retry calls', async () => {
      const baseUrl = 'http://localhost:3000';

      nock(baseUrl)
        .get('/multi-retry')
        .reply(200, { message: 'Multi retry success' });

      const body = await httpfService
        .get<{ message: string }>(`${baseUrl}/multi-retry`)
        .retry(1)
        .retry(2) // 두 번째 retry가 적용됨
        .map((response) => response.body)
        .head();

      expect(body).toEqual({ message: 'Multi retry success' });
    });
  });
});
