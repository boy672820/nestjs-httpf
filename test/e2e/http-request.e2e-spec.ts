import { Test, TestingModule } from '@nestjs/testing';
import { HttpfModule, HttpfService } from '../../lib';
import * as nock from 'nock';
import { pluck } from '@fxts/core';

describe('HTTP', () => {
  let moduleRef: TestingModule;
  let httpfService: HttpfService;

  const baseUrl = 'http://localhost:3000';

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

  describe('GET /hello', () => {
    it('should return "Hello World!"', async () => {
      nock(baseUrl).get('/hello').reply(200, { message: 'Hello World!' });

      const body = await httpfService
        .get<{ message: string }>(`${baseUrl}/hello`)
        .chain(pluck('body'))
        .head();
      expect(body).toEqual({ message: 'Hello World!' });
    });
  });

  describe('POST /echo', () => {
    it('should return echoed body', async () => {
      nock(baseUrl)
        .post('/echo', { message: 'Hello Echo!' })
        .reply(200, { message: 'Hello Echo!' });

      const body = await httpfService
        .post<{ message: string }>(`${baseUrl}/echo`, {
          json: { message: 'Hello Echo!' },
        })
        .chain(pluck('body'))
        .head();
      expect(body).toEqual({ message: 'Hello Echo!' });
    });
  });

  describe('PUT /echo', () => {
    it('should return echoed body', async () => {
      nock(baseUrl)
        .put('/echo', { message: 'Hello Put Echo!' })
        .reply(200, { message: 'Hello Put Echo!' });

      const body = await httpfService
        .put<{ message: string }>(`${baseUrl}/echo`, {
          json: { message: 'Hello Put Echo!' },
        })
        .chain(pluck('body'))
        .head();
      expect(body).toEqual({ message: 'Hello Put Echo!' });
    });
  });

  describe('PATCH /echo', () => {
    it('should return echoed body', async () => {
      nock(baseUrl)
        .patch('/echo', { message: 'Hello Patch Echo!' })
        .reply(200, { message: 'Hello Patch Echo!' });

      const body = await httpfService
        .patch<{ message: string }>(`${baseUrl}/echo`, {
          json: { message: 'Hello Patch Echo!' },
        })
        .chain(pluck('body'))
        .head();
      expect(body).toEqual({ message: 'Hello Patch Echo!' });
    });
  });

  describe('DELETE /echo', () => {
    it('should return echoed body', async () => {
      nock(baseUrl)
        .delete('/echo', { message: 'Hello Delete Echo!' })
        .reply(200, { message: 'Hello Delete Echo!' });

      const body = await httpfService
        .delete<{ message: string }>(`${baseUrl}/echo`, {
          json: { message: 'Hello Delete Echo!' },
        })
        .chain(pluck('body'))
        .head();

      expect(body).toEqual({ message: 'Hello Delete Echo!' });
    });
  });

  describe('HEAD /echo', () => {
    it('should return 200 status code', async () => {
      nock(baseUrl).head('/echo').reply(200);

      const statusCode = await httpfService
        .head<void>(`${baseUrl}/echo`)
        .chain(pluck('statusCode'))
        .head();

      expect(statusCode).toBe(200);
    });
  });
});
