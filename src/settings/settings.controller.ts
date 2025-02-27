import { Body, Controller, ForbiddenException, Get, HttpCode, Logger, Patch, Req, Version } from '@nestjs/common';
import { ApiBody, ApiForbiddenResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { SettingsDto } from '../dto/settings-dto';
import { SettingsService } from './settings.service';
import { SettingsUpdateDto } from '../dto/settings-update-dto';

@Controller('settings')
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name); // Scoped logger

  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get enterprise settings'
  })
  @ApiOkResponse({ type: SettingsDto })
  @Version('1')
  async getSettingsV1(@Req() request: Request): Promise<SettingsDto> {
    return await this.settingsService.getAllSettings(request['auth-enterprise-id']);
  }

  @Version('1')
  @Patch('')
  @ApiOperation({ summary: 'Patch settings' })
  @ApiNoContentResponse({ description: 'Settings patched successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @HttpCode(204)
  @ApiBody({ type: SettingsUpdateDto, description: 'Settings partial data' })
  @Version('1')
  async patchSettingsV1(@Req() request: Request, @Body() settings: SettingsUpdateDto): Promise<void> {
    let updatedSuccessfully = true;
    try {
      updatedSuccessfully = await this.settingsService.patchSettings(request['auth-enterprise-id'], settings);
    } catch {
      throw new ForbiddenException();
    }

    if (!updatedSuccessfully) {
      throw new ForbiddenException();
    }
  }
}
