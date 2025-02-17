import { Metadata } from '../interfaces/metadata.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { DispatcherDto } from './dispatcher-dto';

export class AdministratorsDto {
  @ApiProperty({
    description: 'Array of administrators',
    required: true,
    type: [DispatcherDto]
  })
  @IsNotEmpty()
  administrators: DispatcherDto[];

  @ApiProperty({
    description: 'Response metadata',
    required: true,
    type: Metadata
  })
  @IsNotEmpty()
  metadata: Metadata;
}
