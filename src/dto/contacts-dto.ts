import { Metadata } from '../interfaces/metadata.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ContactDto } from './contact-dto';

export class ContactsDto {
  @ApiProperty({
    description: 'Array of contacts',
    required: true,
    type: [ContactDto]
  })
  @IsNotEmpty()
  contacts: ContactDto[];

  @ApiProperty({
    description: 'Response metadata',
    required: true,
    type: Metadata
  })
  @IsNotEmpty()
  metadata: Metadata;
}
