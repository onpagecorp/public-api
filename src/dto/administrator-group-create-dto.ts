import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AdministratorGroupCreateDto {
  @ApiProperty({
    description: 'Administrator group name',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'List of administrator IDs.',
    required: false,
    isArray: true,
    type: Number
  })
  administrators?: number[];
}
