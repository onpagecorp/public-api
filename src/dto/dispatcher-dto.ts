import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { DispatcherPermissions } from './dispatcher-permissions';

export class DispatcherDto {
  @ApiProperty({
    description: 'Dispatcher ID',
    required: true
  })
  id: number;

  @ApiProperty({
    description: 'OnPage ID',
    required: true
  })
  opid: string;

  @ApiProperty({
    description: 'Dispatcher first name',
    required: true
  })
  firstName: string;

  @ApiProperty({
    description: 'Dispatcher last name',
    required: true
  })
  lastName: string;

  @ApiProperty({
    description: 'Dispatcher email address',
    required: true
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Dispatcher phone number',
    required: true
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({
    description: 'Groups the dispatcher is member of',
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
    description: 'Dispatcher permissions',
    required: true,
    type: DispatcherPermissions
  })
  permissions: DispatcherPermissions;
}
