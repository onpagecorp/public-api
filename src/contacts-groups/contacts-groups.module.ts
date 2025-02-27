import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEntity } from '../entity/group-entity';
import { GroupMemberEntity } from '../entity/group-member-entity';
import { ContactsService } from '../contacts/contacts.service';
import { ContactsController } from '../contacts/contacts.controller';
import { ContactsGroupsControllerV1 } from './contacts-groups-controller.v1';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupEntity, GroupMemberEntity]) // Register the entity
  ],
  providers: [ContactsService],
  controllers: [ContactsController, ContactsGroupsControllerV1],
  exports: [TypeOrmModule]
})
export class ContactsGroupsModule {}
