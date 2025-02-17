import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEntity } from '../entity/group-entity';
import { ContactsController } from './contacts.controller';
import { GroupMemberEntity } from '../entity/group-member-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupEntity, GroupMemberEntity]) // Register the entity
  ],
  providers: [ContactsService],
  controllers: [ContactsController],
  exports: [TypeOrmModule]
})
export class ContactsModule {}
