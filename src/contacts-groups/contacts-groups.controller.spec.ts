import { Test, TestingModule } from '@nestjs/testing';
import { ContactsGroupsControllerV1 } from './contacts-groups-controller.v1';

describe('ContactsGroupsController', () => {
  let controller: ContactsGroupsControllerV1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsGroupsControllerV1]
    }).compile();

    controller = module.get<ContactsGroupsControllerV1>(ContactsGroupsControllerV1);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
