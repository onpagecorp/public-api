import { Test, TestingModule } from '@nestjs/testing';
import { PagesControllerV1 } from './pagesControllerV1';

describe('PagesController', () => {
  let controller: PagesControllerV1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagesControllerV1],
    }).compile();

    controller = module.get<PagesControllerV1>(PagesControllerV1);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
