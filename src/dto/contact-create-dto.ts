import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class ContactCreateDto {
  @ApiProperty({
    description: 'OnPage ID',
    required: true
  })
  opid: string;

  @ApiProperty({
    description: 'Contact first name',
    required: true
  })
  firstName: string;

  @ApiProperty({
    description: 'Contact last name',
    required: true
  })
  lastName: string;

  @ApiProperty({
    description: 'Contact email address',
    required: true
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contact password',
    required: true
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Contact phone number',
    required: true
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;
}
