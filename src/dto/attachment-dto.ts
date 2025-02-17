import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AttachmentShortDto } from './attachment-short-dto';

export class AttachmentDto extends AttachmentShortDto {
  @ApiProperty({
    description: 'Attachment buffer',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  data: string;
}
