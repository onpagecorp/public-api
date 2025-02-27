import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { AdministratorPermissions } from './administrator-permissions';

export class AdministratorDto {
  @ApiProperty({
    description: 'Administrator ID',
    required: true
  })
  id: number;

  @ApiProperty({
    description: 'Administrator first name',
    required: true
  })
  firstName: string;

  @ApiProperty({
    description: 'Administrator last name',
    required: true
  })
  lastName: string;

  @ApiProperty({
    description: 'Administrator email address',
    required: true
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Administrator phone number',
    required: true
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({
    description: 'Groups the administrator is member of',
    required: false,
    type: Number,
    isArray: true
  })
  groups: number[];

  @ApiProperty({
    description: 'Super admin flag',
    required: false,
    type: Boolean,
    default: false
  })
  superAdmin: boolean;

  @ApiProperty({
    description: 'Administrator permissions',
    required: true,
    type: AdministratorPermissions
  })
  permissions: AdministratorPermissions;
}
