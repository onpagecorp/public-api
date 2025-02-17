import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ValueTransformer
} from 'typeorm';
import { Logger } from '@nestjs/common';

export class EscalationIntervalTransformer implements ValueTransformer {
  private readonly logger = new Logger(EscalationIntervalTransformer.name);

  // Convert database value (integer) to enum when fetching
  from(value: number): ESCALATION_INTERVAL {
    this.logger.debug(
      `EscalationIntervalTransformer: ${value}: ${typeof value}`
    );
    if (value === 1) {
      return ESCALATION_INTERVAL['1 minute'];
    } else if (value === 2) {
      return ESCALATION_INTERVAL['2 minutes'];
    } else if (value === 3) {
      return ESCALATION_INTERVAL['3 minutes'];
    } else if (value === 5) {
      return ESCALATION_INTERVAL['5 minutes'];
    } else if (value === 10) {
      return ESCALATION_INTERVAL['10 minutes'];
    } else if (value === 15) {
      return ESCALATION_INTERVAL['15 minutes'];
    } else if (value === 20) {
      return ESCALATION_INTERVAL['20 minutes'];
    } else if (value === 25) {
      return ESCALATION_INTERVAL['25 minutes'];
    } else if (value === 30) {
      return ESCALATION_INTERVAL['30 minutes'];
    } else if (value === 35) {
      return ESCALATION_INTERVAL['35 minutes'];
    } else if (value === 40) {
      return ESCALATION_INTERVAL['40 minutes'];
    } else if (value === 45) {
      return ESCALATION_INTERVAL['45 minutes'];
    } else if (value === 50) {
      return ESCALATION_INTERVAL['50 minutes'];
    } else if (value === 55) {
      return ESCALATION_INTERVAL['55 minutes'];
    } else if (value === 60) {
      return ESCALATION_INTERVAL['1 hour'];
    }
    return ESCALATION_INTERVAL.NONE;
  }

  // Convert enum name to integer before saving to the database
  to(value: ESCALATION_INTERVAL): number {
    if (value === ESCALATION_INTERVAL['1 minute']) {
      return 1;
    } else if (value === ESCALATION_INTERVAL['2 minutes']) {
      return 2;
    } else if (value === ESCALATION_INTERVAL['3 minutes']) {
      return 3;
    } else if (value === ESCALATION_INTERVAL['5 minutes']) {
      return 5;
    } else if (value === ESCALATION_INTERVAL['10 minutes']) {
      return 10;
    } else if (value === ESCALATION_INTERVAL['15 minutes']) {
      return 15;
    } else if (value === ESCALATION_INTERVAL['20 minutes']) {
      return 20;
    } else if (value === ESCALATION_INTERVAL['25 minutes']) {
      return 25;
    } else if (value === ESCALATION_INTERVAL['30 minutes']) {
      return 30;
    } else if (value === ESCALATION_INTERVAL['35 minutes']) {
      return 35;
    } else if (value === ESCALATION_INTERVAL['40 minutes']) {
      return 40;
    } else if (value === ESCALATION_INTERVAL['45 minutes']) {
      return 45;
    } else if (value === ESCALATION_INTERVAL['50 minutes']) {
      return 50;
    } else if (value === ESCALATION_INTERVAL['55 minutes']) {
      return 55;
    } else if (value === ESCALATION_INTERVAL['1 hour']) {
      return 60;
    } else {
      return null;
    }
  }
}

export class EscalationFactorTransformer implements ValueTransformer {
  private readonly logger = new Logger(EscalationFactorTransformer.name);

  // Convert database value (integer) to enum when fetching
  from(value: number) {
    if (value === null) return ESCALATION_FACTOR.NONE; // Handle NULL case
    if (value === 0) return ESCALATION_FACTOR.DELIVERED;
    if (value === 1) return ESCALATION_FACTOR.READ;
    if (value === 2) return ESCALATION_FACTOR.REPLIED;
  }

  // Convert enum name to integer before saving to the database
  to(value: ESCALATION_FACTOR): number {
    if (value === ESCALATION_FACTOR.NONE) return null;
    if (value === ESCALATION_FACTOR.DELIVERED) return 0;
    if (value === ESCALATION_FACTOR.READ) return 1;
    if (value === ESCALATION_FACTOR.REPLIED) return 2;
  }
}

@Entity({
  name: 'groups'
})
export class GroupEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'group_id'
  })
  id: bigint;

  @Column({
    type: 'bigint',
    nullable: false,
    name: 'enterprise_id'
  })
  enterpriseId: bigint;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 250,
    name: 'name'
  })
  name: string;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'escalation'
  })
  escalation: boolean;

  @Column({
    type: 'smallint',
    nullable: true,
    name: 'escalation',
    transformer: new EscalationIntervalTransformer()
  })
  escalationInterval: ESCALATION_INTERVAL;

  @Column({
    type: 'tinyint',
    nullable: true,
    name: 'escalation_factor',
    transformer: new EscalationFactorTransformer()
  })
  escalationFactor: ESCALATION_FACTOR;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 255,
    name: 'pager_number'
  })
  pagerNumber: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 255,
    name: 'alternative_op_id'
  })
  alternativePagerNumber: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'fail_over_opids'
  })
  failOverOpids: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'fail_over_group_opids'
  })
  failOverGroupOpids: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'fail_report_email'
  })
  failReportEmail: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'fail_report_original_message'
  })
  failOverIncludeOriginalMessage: boolean;
}

export enum ESCALATION_INTERVAL {
  'NONE' = null,
  '1 minute' = 1,
  '2 minutes' = 2,
  '3 minutes' = 3,
  '5 minutes' = 5,
  '10 minutes' = 10,
  '15 minutes' = 15,
  '20 minutes' = 20,
  '25 minutes' = 25,
  '30 minutes' = 30,
  '35 minutes' = 35,
  '40 minutes' = 40,
  '45 minutes' = 45,
  '50 minutes' = 50,
  '55 minutes' = 55,
  '1 hour' = 60
}

export enum ESCALATION_FACTOR {
  'NONE' = 'NONE',
  'DELIVERED' = 'DELIVERED',
  'READ' = 'READ',
  'REPLIED' = 'REPLIED'
}
