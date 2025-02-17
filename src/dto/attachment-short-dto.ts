import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AttachmentShortDto {
  @ApiProperty({
    description: 'Attachment ID',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Attachment file name',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Attachment size in bytes',
    required: true
  })
  @IsNumber()
  size: number;
}
