import { Module } from '@nestjs/common';
import { ContactsService } from '../contacts/contacts.service';
import { GroupEntity } from './group-entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsController } from '../contacts/contacts.controller';
import { GroupMemberEntity } from './group-member-entity';

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity, GroupMemberEntity])],
  providers: [ContactsService],
  controllers: [ContactsController],
  exports: [TypeOrmModule]
})
export class GroupEntityModule {}
