import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { AdministratorPermissions } from './administrator-permissions';

export class AdministratorCreateDto {
  @ApiProperty({
    description: 'Administrator password',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  password: string;

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
  @IsString()
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
    required: true,
    type: AdministratorPermissions
  })
  permissions: AdministratorPermissions;
}
