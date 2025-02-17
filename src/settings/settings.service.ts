import { Injectable } from '@nestjs/common';
import { SettingsDto } from '../dto/settings-dto';
import { entity as Entities } from '@onpage-corp/onpage-domain-mysql';
import { SettingsUpdateDto } from '../dto/settings-update-dto';
import { ServiceError } from '../service-error';

@Injectable()
export class SettingsService {
  /**
   * Retrieves all the settings for a given enterprise.
   *
   * @param {number} enterpriseId - The unique identifier of the enterprise.
   * @return {Promise<SettingsDto>} A promise that resolves with the settings data, including on-call reminders, two-factor authentication, and dispatcher session timeout.
   */
  async getAllSettings(enterpriseId: number): Promise<SettingsDto> {
    const Enterprise = Entities.sequelize.models.Enterprise;
    const enterprise = await Enterprise.findByPk(enterpriseId);

    return {
      onCallReminders: false,
      twoFactorAuthentication: false,
      dispatcherSessionTimeout: enterprise.logoutTimeOut || 0
    };
  }

  /**
   * Updates enterprise settings with the provided patch data.
   *
   * @param {number} enterpriseId - The unique identifier of the enterprise to be updated.
   * @param {SettingsUpdateDto} settingsUpdateDto - An object containing the settings to patch, such as dispatcher session timeout.
   * @return {Promise<boolean>} Returns a promise that resolves to true if the update was successful.
   * @throws {ServiceError} Throws an error if the enterprise does not exist or the settings could not be updated.
   */
  async patchSettings(
    enterpriseId: number,
    settingsUpdateDto: SettingsUpdateDto
  ): Promise<boolean> {
    const Enterprise = Entities.sequelize.models.Enterprise;
    const enterprise = await Enterprise.findByPk(enterpriseId);

    if (!enterprise) {
      throw ServiceError.COULD_NOT_UPDATE;
    }

    enterprise.logoutTimeOut = settingsUpdateDto.dispatcherSessionTimeout;
    const updatedEnterprise = await enterprise.save();

    if (!updatedEnterprise) {
      throw ServiceError.COULD_NOT_UPDATE;
    }

    return true;
  }
}
