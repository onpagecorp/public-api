import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Metadata } from '../interfaces/metadata.interface';
import { TemplateDto } from './template-dto';

export class TemplatesDto {
  @ApiProperty({
    description: 'List of templates',
    required: true,
    type: TemplateDto,
    isArray: true
  })
  @IsNotEmpty()
  templates: TemplateDto[];

  @ApiProperty({
    description: 'Response metadata',
    required: true,
    type: Metadata
  })
  @IsNotEmpty()
  metadata: Metadata;
}
