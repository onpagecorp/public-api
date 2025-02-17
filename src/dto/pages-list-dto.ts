import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Metadata } from '../interfaces/metadata.interface';
import { PageDto } from './page-dto';

export class PagesListDto {
  @ApiProperty({
    description: 'Array of pages',
    required: true,
    type: [PageDto]
  })
  @IsNotEmpty()
  pages: PageDto[];

  @ApiProperty({
    description: 'Response metadata',
    required: true,
    type: Metadata
  })
  @IsNotEmpty()
  metadata: Metadata;
}
