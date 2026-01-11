import { Test, TestingModule } from '@nestjs/testing';
import { HttpfModule, HttpfService } from '../../lib';
import * as nock from 'nock';

describe('Merge Map', () => {
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

  describe('mergeMap', () => {
    it('should map and flatten the results', async () => {
      const baseUrl = 'http://localhost:3000';

      nock(baseUrl)
        .get('/items')
        .reply(200, [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ]);

      const body = await httpfService
        .get<Array<{ id: number; name: string }>>(`${baseUrl}/items`)
        .mergeMap((response) => response.body)
        .map((item) => item.name)
        .toArray();

      expect(body).toEqual(['Item 1', 'Item 2']);
    });
  });
});
