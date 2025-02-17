import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class ContactDto {
  @ApiProperty({
    description: 'Account ID',
    required: true
  })
  id: number;

  @ApiProperty({
    description: 'OnPage ID',
    required: true
  })
  opid: string;

  @ApiProperty({
    description: 'Account first name',
    required: true
  })
  firstName: string;

  @ApiProperty({
    description: 'Account last name',
    required: true
  })
  lastName: string;

  @ApiProperty({
    description: 'Account email address',
    required: true
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Account phone number',
    required: true
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({
    description: 'Account OPID status',
    required: true
  })
  status: string;

  @ApiProperty({
    description: 'Groups the account is member of',
    required: false
  })
  groups: string[];
}
