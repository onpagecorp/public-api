import { Test, TestingModule } from '@nestjs/testing';
import { AdministratorGroupsController } from './administrator-groups.controller';

describe('AdministratorGroupsController', () => {
  let controller: AdministratorGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdministratorGroupsController]
    }).compile();

    controller = module.get<AdministratorGroupsController>(
      AdministratorGroupsController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
