import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SettingsUpdateDto {
  @ApiProperty({
    description: 'On-call reminders',
    required: false
  })
  onCallReminders: boolean;

  @ApiProperty({
    description: 'F2A authentication',
    required: false
  })
  @IsBoolean()
  twoFactorAuthentication: boolean;

  @ApiProperty({
    description: 'Dispatcher console time out in minutes',
    required: false
  })
  @IsBoolean()
  dispatcherSessionTimeout: boolean;
}
