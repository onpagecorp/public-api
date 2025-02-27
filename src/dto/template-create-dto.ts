import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TemplateCreateDto {
  @ApiProperty({
    description: 'Template name',
    required: true
  })
  name: string;

  @ApiProperty({
    description: 'Template subject',
    required: true
  })
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: 'Template body',
    required: false
  })
  body?: string;

  @ApiProperty({
    description: 'Predefined replies',
    required: false,
    type: [String]
  })
  predefinedReplies?: string[];

  @ApiProperty({
    description: 'Sync to device flag',
    required: false,
    default: false
  })
  syncToDevice?: boolean;
}
