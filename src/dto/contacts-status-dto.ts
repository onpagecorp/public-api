import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Metadata } from '../interfaces/metadata.interface';
import { ContactsStatusTypesDto } from './contacts-status-types-dto';

export class ContactsStatusDto {
  @ApiProperty({
    description: 'List of contacts by status',
    required: true,
    type: ContactsStatusTypesDto
  })
  @IsNotEmpty()
  contactsStatus: ContactsStatusTypesDto;

  @ApiProperty({
    description: 'Response metadata',
    required: true,
    type: Metadata
  })
  @IsNotEmpty()
  metadata: Metadata;
}
