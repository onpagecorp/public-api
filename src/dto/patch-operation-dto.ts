import { ApiProperty } from '@nestjs/swagger';

export class PatchOperationDto {
  @ApiProperty({
    description: 'The operation to be performed',
    enum: ['add', 'remove', 'replace', 'move', 'copy', 'test']
  })
  op: string;

  @ApiProperty({
    description: 'A JSON Pointer that indicates the location to perform the operation'
  })
  path: string;

  @ApiProperty({
    description: 'The value to be used for the operation (if applicable)',
    required: false
  })
  value?: any;

  @ApiProperty({
    description: 'The source location for move or copy operations (if applicable)',
    required: false
  })
  from?: string;
}
