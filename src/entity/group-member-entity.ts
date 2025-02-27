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
  groupId: number;

  @PrimaryColumn({
    type: 'bigint',
    nullable: false,
    name: 'account_id'
  })
  accountId: number;

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
