import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ContactGroupMemberDto } from './contact-group-member-dto';

export enum ESCALATION_INTERVAL_DTO {
  'NONE' = 'NONE',
  '1 minute' = '1 minute',
  '2 minutes' = '2 minutes',
  '3 minutes' = '3 minutes',
  '5 minutes' = '5 minutes',
  '10 minutes' = '10 minutes',
  '15 minutes' = '15 minutes',
  '20 minutes' = '20 minutes',
  '25 minutes' = '25 minutes',
  '30 minutes' = '30 minutes',
  '35 minutes' = '35 minutes',
  '40 minutes' = '40 minutes',
  '45 minutes' = '45 minutes',
  '50 minutes' = '50 minutes',
  '55 minutes' = '55 minutes',
  '1 hour' = '1 hour'
}

export enum ESCALATION_FACTOR_DTO {
  'NONE' = 'NONE',
  'DELIVERED' = 'DELIVERED',
  'READ' = 'READ',
  'REPLIED' = 'REPLIED'
}

export class GroupFailOverDto {
  @ApiProperty({
    description: 'Fail over includes origin al message',
    required: true,
    type: Boolean
  })
  @IsBoolean()
  includeOriginalMessage: boolean;

  @ApiProperty({
    description: 'Fail over to emails list',
    required: true,
    type: [String]
  })
  @IsArray()
  emails: string[];

  @ApiProperty({
    description: 'Fail over to contacts list',
    required: false,
    type: [Number]
  })
  @IsArray()
  contacts?: number[];

  @ApiProperty({
    description: "Fail over to contacts' groups list",
    required: false,
    type: [Number]
  })
  @IsArray()
  groups?: number[];
}

export class ContactGroupDto {
  @ApiProperty({
    description: 'Group ID',
    required: true,
    type: Number
  })
  id: number;

  @ApiProperty({
    description: 'OnPage ID (OPID)',
    required: true,
    type: String
  })
  @IsNotEmpty()
  @IsString()
  opid: string;

  @ApiProperty({
    description: 'Group name',
    required: true,
    type: String
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Group description',
    required: false,
    type: String
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Contacts of the group',
    required: true,
    type: [ContactGroupMemberDto]
  })
  contacts: ContactGroupMemberDto[];

  @ApiProperty({
    description: 'Escalation flag',
    required: true,
    type: Boolean
  })
  @IsBoolean()
  escalation?: boolean;

  @ApiProperty({
    description: 'Escalation interval',
    required: false,
    enum: ESCALATION_INTERVAL_DTO,
    enumName: 'ESCALATION_INTERVAL_DTO'
  })
  escalationInterval?: ESCALATION_INTERVAL_DTO;

  @ApiProperty({
    description: 'Escalation factor',
    required: false,
    enum: ESCALATION_FACTOR_DTO,
    enumName: 'ESCALATION_FACTOR'
  })
  escalationFactor?: ESCALATION_FACTOR_DTO;

  @ApiProperty({
    description: 'Fail over parameters',
    required: false,
    type: GroupFailOverDto
  })
  failOver?: GroupFailOverDto;
}

export class ContactGroupCreateDto {
  @ApiProperty({
    description: 'OnPage ID (OPID)',
    required: true,
    type: String
  })
  @IsNotEmpty()
  @IsString()
  opid: string;

  @ApiProperty({
    description: 'Group name',
    required: true,
    type: String
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Group description',
    required: false,
    type: String
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Contacts of the group',
    required: true,
    type: [ContactGroupMemberDto]
  })
  contacts?: ContactGroupMemberDto[];

  @ApiProperty({
    description: 'Escalation flag',
    required: true,
    type: Boolean
  })
  @IsBoolean()
  escalation?: boolean;

  @ApiProperty({
    description: 'Escalation interval',
    required: false,
    enum: ESCALATION_INTERVAL_DTO,
    enumName: 'ESCALATION_INTERVAL_DTO'
  })
  escalationInterval?: ESCALATION_INTERVAL_DTO;

  @ApiProperty({
    description: 'Escalation factor',
    required: false,
    enum: ESCALATION_FACTOR_DTO,
    enumName: 'ESCALATION_FACTOR'
  })
  escalationFactor?: ESCALATION_FACTOR_DTO;

  @ApiProperty({
    description: 'Fail over parameters',
    required: false,
    type: GroupFailOverDto
  })
  failOver?: GroupFailOverDto;
}

export class ContactGroupUpdateDto {
  @ApiProperty({
    description: 'OnPage ID (OPID)',
    required: true,
    type: String
  })
  @IsNotEmpty()
  @IsString()
  opid: string;

  @ApiProperty({
    description: 'Group name',
    required: true,
    type: String
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Group description',
    required: false,
    type: String
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Contacts of the group',
    required: true,
    type: [ContactGroupMemberDto]
  })
  contacts?: ContactGroupMemberDto[];

  @ApiProperty({
    description: 'Escalation flag',
    required: true,
    type: Boolean
  })
  @IsBoolean()
  escalation?: boolean;

  @ApiProperty({
    description: 'Escalation interval',
    required: false,
    enum: ESCALATION_INTERVAL_DTO,
    enumName: 'ESCALATION_INTERVAL_DTO'
  })
  escalationInterval?: ESCALATION_INTERVAL_DTO;

  @ApiProperty({
    description: 'Escalation factor',
    required: false,
    enum: ESCALATION_FACTOR_DTO,
    enumName: 'ESCALATION_FACTOR'
  })
  escalationFactor?: ESCALATION_FACTOR_DTO;

  @ApiProperty({
    description: 'Fail over parameters',
    required: false,
    type: GroupFailOverDto
  })
  failOver?: GroupFailOverDto;
}
