import { Test, TestingModule } from '@nestjs/testing';
import { ContactsStatusService } from './contacts-status.service';

describe('ContactsStatusService', () => {
  let service: ContactsStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactsStatusService],
    }).compile();

    service = module.get<ContactsStatusService>(ContactsStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
