import { Test, TestingModule } from '@nestjs/testing';
import { AdministratorGroupsService } from './administrator-groups.service';

describe('AdministratorGroupsService', () => {
  let service: AdministratorGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdministratorGroupsService],
    }).compile();

    service = module.get<AdministratorGroupsService>(AdministratorGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
