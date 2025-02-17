import { ApiProperty } from '@nestjs/swagger';
import { IsNull } from 'typeorm';

export class ContactGroupMemberDto {
  @ApiProperty({
    description: 'Contact ID',
    required: true,
    type: Number
  })
  contactId: bigint;

  @ApiProperty({
    description: 'Escalation order',
    required: false,
    type: Number,
    nullable: true
  })
  order?: number;
}
