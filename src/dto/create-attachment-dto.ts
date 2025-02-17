import { ApiProperty } from '@nestjs/swagger';

export class CreateAttachmentDto {
  @ApiProperty({
    description: 'Attachment ID',
    required: true
  })
  id: string;
}
