import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'group_member'
})
export class GroupMemberEntity {
  @PrimaryColumn({
    type: 'bigint',
    nullable: false,
    name: 'group_id'
  })
  groupId: bigint;

  @PrimaryColumn({
    type: 'bigint',
    nullable: false,
    name: 'account_id'
  })
  accountId: bigint;

  @Column({
    type: 'smallint',
    nullable: true,
    name: 'escalation_order'
  })
  escalationOrder: number;

  @Column({
    type: 'datetime',
    nullable: false,
    name: 'latest_revision_ts'
  })
  latestRevisionDate: Date;
}
