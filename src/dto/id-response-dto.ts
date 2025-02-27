import { ApiProperty } from '@nestjs/swagger';

export class IdResponseDto {
  @ApiProperty({
    description: 'ID',
    required: true
  })
  id: number;
}
