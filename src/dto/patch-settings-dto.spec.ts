import { SettingsUpdateDto } from './settings-update-dto';

describe('PatchSettingsDto', () => {
  it('should be defined', () => {
    expect(new SettingsUpdateDto()).toBeDefined();
  });
});
