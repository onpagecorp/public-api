import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Metadata } from '../interfaces/metadata.interface';
import { ContactGroupDto } from './contact-group-dto';

export class ContactGroupsDto {
  @ApiProperty({
    description: 'Array of groups',
    required: true,
    type: [ContactGroupDto]
  })
  @IsNotEmpty()
  contacts: ContactGroupDto[];

  @ApiProperty({
    description: 'Response metadata',
    required: true,
    type: Metadata
  })
  @IsNotEmpty()
  metadata: Metadata;
}
