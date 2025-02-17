import { ApiProperty } from '@nestjs/swagger';

export enum RecipientTypeDto {
  DISPATCHER = 'dispatcher',
  EMAIL = 'email',
  OPID = 'opid',
  SYSTEM = 'system'
}

export class RecipientDto {
  @ApiProperty({
    description: 'Type',
    required: true,
    enum: RecipientTypeDto
  })
  type: RecipientTypeDto;

  @ApiProperty({
    description: 'Caption',
    required: true,
    type: String
  })
  caption: string;

  @ApiProperty({
    description: 'Type',
    required: true,
    type: String
  })
  value: string;
}
