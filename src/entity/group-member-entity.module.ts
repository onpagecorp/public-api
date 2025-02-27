import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsService } from '../contacts/contacts.service';
import { ContactsController } from '../contacts/contacts.controller';
import { GroupMemberEntity } from './group-member-entity';
import { ContactsGroupsControllerV1 } from '../contacts-groups/contacts-groups-controller.v1';

@Module({
  imports: [TypeOrmModule.forFeature([GroupMemberEntity])],
  providers: [ContactsService],
  controllers: [ContactsController, ContactsGroupsControllerV1],
  exports: [TypeOrmModule]
})
export class GroupMemberEntityModule {}
