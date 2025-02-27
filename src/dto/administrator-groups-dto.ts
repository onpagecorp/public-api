import { ApiProperty } from '@nestjs/swagger';
import { Metadata } from '../interfaces/metadata.interface';
import { IsNotEmpty } from 'class-validator';
import { AdministratorGroupDto } from './administrator-group-dto';

export class AdministratorGroupsDto {
  @ApiProperty({
    description: 'Administrator groups',
    required: true,
    isArray: true,
    type: AdministratorGroupDto
  })
  groups: AdministratorGroupDto[];

  @ApiProperty({
    description: 'Response metadata',
    required: true,
    type: Metadata
  })
  @IsNotEmpty()
  metadata: Metadata;
}
