import { ServiceError } from './service-error';

describe('ServiceError', () => {
  it('should be defined', () => {
    expect(new ServiceError()).toBeDefined();
  });
});
