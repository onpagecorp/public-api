import { ApiProperty } from '@nestjs/swagger';

export class DispatcherPermissions {
  @ApiProperty({
    description: 'Can create escalation group',
    required: false,
    type: Boolean,
    default: false
  })
  createEscalation: true;

  @ApiProperty({
    description: 'Can create group',
    required: false,
    type: Boolean,
    default: false
  })
  groupCreate: true;

  @ApiProperty({
    description: 'Can delete contact',
    required: false,
    type: Boolean,
    default: false
  })
  contactDelete: true;

  @ApiProperty({
    description: 'Can edit contact',
    required: false,
    type: Boolean,
    default: false
  })
  contactEdit: true;

  @ApiProperty({
    description: 'Can create contact',
    required: false,
    type: Boolean,
    default: false
  })
  contactAdd: true;

  @ApiProperty({
    description: 'Can add contact a group',
    required: false,
    type: Boolean,
    default: false
  })
  contactToGroup: true;

  @ApiProperty({
    description: 'an remove from a group',
    required: false,
    type: Boolean,
    default: false
  })
  removeContactFromGroup: true;

  @ApiProperty({
    description: 'Can delete group',
    required: false,
    type: Boolean,
    default: false
  })
  deleteGroup: true;

  @ApiProperty({
    description: 'Can edit group',
    required: false,
    type: Boolean,
    default: false
  })
  editGroup: true;

  @ApiProperty({
    description: 'Can edit escalation group',
    required: false,
    type: Boolean,
    default: false
  })
  editEscalationGroup: true;

  @ApiProperty({
    description: 'Can view scheduler',
    required: false,
    type: Boolean,
    default: false
  })
  viewSchedule: true;

  @ApiProperty({
    description: 'Can edit scheduler',
    required: false,
    type: Boolean,
    default: false
  })
  editSchedule: true;

  @ApiProperty({
    description: 'Can login to reports',
    required: false,
    type: Boolean,
    default: false
  })
  viewReports: true;
}
