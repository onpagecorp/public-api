import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { AdministratorPermissions } from './administrator-permissions';

export class AdministratorUpdateDto {
  @ApiProperty({
    description: 'Administrator password',
    required: false
  })
  @IsString()
  @IsNotEmpty()
  password?: string;

  @ApiProperty({
    description: 'Administrator first name',
    required: false
  })
  firstName?: string;

  @ApiProperty({
    description: 'Administrator last name',
    required: false
  })
  lastName?: string;

  @ApiProperty({
    description: 'Administrator phone number',
    required: false
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Groups the administrator is member of',
    required: false,
    type: Number,
    isArray: true
  })
  groups?: number[];

  @ApiProperty({
    description: 'Super admin flag',
    required: false,
    type: Boolean,
    default: false
  })
  superAdmin?: boolean;

  @ApiProperty({
    description: 'Administrator permissions',
    required: false,
    type: AdministratorPermissions
  })
  permissions?: AdministratorPermissions;
}
