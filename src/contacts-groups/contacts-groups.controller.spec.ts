import { Test, TestingModule } from '@nestjs/testing';
import { ContactGroupsControllerV1 } from './contact-groups-controller.v1';

describe('ContactsGroupsController', () => {
  let controller: ContactGroupsControllerV1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactGroupsControllerV1],
    }).compile();

    controller = module.get<ContactGroupsControllerV1>(ContactGroupsControllerV1);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
