import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsService } from '../contacts/contacts.service';
import { ContactsController } from '../contacts/contacts.controller';
import { GroupMemberEntity } from './group-member-entity';

@Module({
  imports: [TypeOrmModule.forFeature([GroupMemberEntity])],
  providers: [ContactsService],
  controllers: [ContactsController],
  exports: [TypeOrmModule]
})
export class GroupMemberEntityModule {}
