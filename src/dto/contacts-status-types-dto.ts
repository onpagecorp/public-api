import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty } from 'class-validator';

export class ContactsStatusTypesDto {
  @ApiProperty({
    description: 'Array of logged in contacts',
    required: true,
    type: String,
    isArray: true
  })
  @ArrayNotEmpty()
  loggedIn: string[];
  @ApiProperty({
    description: 'Array of logged out in contacts',
    required: true,
    type: String,
    isArray: true
  })
  @ArrayNotEmpty()
  loggedOff: string[];
  @ApiProperty({
    description: 'Array of contacts with PAGER OFF',
    required: true,
    type: String,
    isArray: true
  })
  @ArrayNotEmpty()
  pagerOff: string[];
}
