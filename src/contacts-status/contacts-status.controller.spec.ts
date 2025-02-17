import { Test, TestingModule } from '@nestjs/testing';
import { ContactsStatusController } from './contacts-status.controller';

describe('ContactsStatusController', () => {
  let controller: ContactsStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsStatusController],
    }).compile();

    controller = module.get<ContactsStatusController>(ContactsStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
