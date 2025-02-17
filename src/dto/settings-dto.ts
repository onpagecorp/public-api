import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SettingsDto {
  @ApiProperty({
    description: 'On-call reminders',
    required: true
  })
  onCallReminders: boolean;

  @ApiProperty({
    description: 'F2A authentication',
    required: true
  })
  @IsBoolean()
  twoFactorAuthentication: boolean;

  @ApiProperty({
    description: 'Dispatcher console time out in minutes',
    required: true
  })
  @IsBoolean()
  dispatcherSessionTimeout: boolean;
}
