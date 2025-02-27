import { ApiProperty } from '@nestjs/swagger';

export class AdministratorGroupDto {
  @ApiProperty({
    description: 'Administrator group ID',
    required: true
  })
  id: number;

  @ApiProperty({
    description: 'Administrator group name',
    required: true
  })
  name: string;

  @ApiProperty({
    description: 'List of administrator IDs in the group',
    required: true,
    isArray: true,
    type: Number
  })
  administrators: number[];
}
