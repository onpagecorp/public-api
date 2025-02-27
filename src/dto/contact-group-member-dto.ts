import { ApiProperty } from '@nestjs/swagger';

export class ContactGroupMemberDto {
  @ApiProperty({
    description: 'Contact ID',
    required: true,
    type: Number
  })
  contactId: number;

  @ApiProperty({
    description: 'Escalation order',
    required: false,
    type: Number,
    nullable: true
  })
  order?: number;
}
