import { Metadata } from '../interfaces/metadata.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { AdministratorDto } from './administrator-dto';

export class AdministratorsDto {
  @ApiProperty({
    description: 'Array of administrators',
    required: true,
    type: [AdministratorDto]
  })
  @IsNotEmpty()
  administrators: AdministratorDto[];

  @ApiProperty({
    description: 'Response metadata',
    required: true,
    type: Metadata
  })
  @IsNotEmpty()
  metadata: Metadata;
}
