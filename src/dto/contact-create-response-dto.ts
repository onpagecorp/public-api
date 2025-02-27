import { ApiProperty } from '@nestjs/swagger';
import { IdResponseDto } from './id-response-dto';

export class ContactCreateResponseDto {
  @ApiProperty({
    description: 'Contact',
    required: true
  })
  contact: IdResponseDto;
}
