import { Test, TestingModule } from '@nestjs/testing';
import { HttpfModule, HttpfService } from '../../lib';

describe('Catch Error', () => {
  let moduleRef: TestingModule;
  let httpfService: HttpfService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [HttpfModule],
    }).compile();

    await moduleRef.init();

    httpfService = moduleRef.get(HttpfService);
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  describe('GET /non-existent-endpoint', () => {
    it('should catch 404 error', async () => {
      const result = await httpfService
        .get<string>('http://localhost:3000/non-existent-endpoint')
        .catchError((error) => error)
        .head();

      expect(result).toBeInstanceOf(Error);
    });

    it('should catch error and transform it', async () => {
      const result = await httpfService
        .get<string>('http://localhost:3000/non-existent-endpoint')
        .catchError((error) => ({ isError: true, error }))
        .head();

      expect(result).toHaveProperty('isError', true);
      expect(result).toHaveProperty('error');
      expect((result as { error: unknown }).error).toBeInstanceOf(Error);
    });

    it('should use fxts methods like filter, take, toArray', async () => {
      const result = await httpfService
        .get<string>('http://localhost:3000/non-existent-endpoint')
        .catchError(() => ({ type: 'error' as const }))
        .filter((response) => 'type' in response)
        .take(1)
        .toArray();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ type: 'error' });
    });
  });
});
