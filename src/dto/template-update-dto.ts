import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from "class-validator";

export class TemplateUpdateDto {
  @ApiProperty({
    description: 'Template name',
    example: 'Template name',
    required: false
  })
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: 'Template subject',
    required: false
  })
  @IsNotEmpty()
  subject?: string;

  @ApiProperty({
    description: 'Template body',
    required: false
  })
  body?: string;

  @ApiProperty({
    description: 'Predefined replies',
    required: false,
    type: String,
    isArray: true
  })
  predefinedReplies?: string[];

  @ApiProperty({
    description: 'Sync to device flag',
    required: false
  })
  syncToDevice?: boolean;
}
