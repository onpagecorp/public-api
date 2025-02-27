import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PagesControllerV1 } from './pages/pagesControllerV1';
import { AdministratorsController } from './administrators/administrators.controller';
import { AttachmentsController } from './attachments/attachments.controller';
import { ContactsController } from './contacts/contacts.controller';
import { TemplatesController } from './templates/templates.controller';
import { SettingsController } from './settings/settings.controller';
import { ContactsService } from './contacts/contacts.service';
import { AuthModule } from './auth/auth.module';
import { ContactsModule } from './contacts/contacts.module';
import { AuthGuard } from './auth/auth.guard';
import { ConfigModule } from '@nestjs/config';
import { ContactsGroupsControllerV1 } from './contacts-groups/contacts-groups-controller.v1';
import { ContactsGroupsModule } from './contacts-groups/contacts-groups.module';
import { AdministratorsService } from './administrators/administrators.service';
import { TemplatesService } from './templates/templates.service';
import { AttachmentsService } from './attachments/attachments.service';
import { SettingsService } from './settings/settings.service';
import { SettingsModule } from './settings/settings.module';
import { PagesService } from './pages/pages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as DbConfig from '/opt/onpage-db-config.js';
import { GroupEntityModule } from './entity/group-entity.module';
import { ContactsStatusController } from './contacts-status/contacts-status.controller';
import { ContactsStatusService } from './contacts-status/contacts-status.service';
import { ContactsStatusModule } from './contacts-status/contacts-status.module';
import { AdministratorGroupsController } from './administrator-groups/administrator-groups.controller';
import { AdministratorGroupsService } from './administrator-groups/administrator-groups.service';

@Module({
  imports: [
    AuthModule,
    ContactsModule,
    ConfigModule.forRoot({
      isGlobal: true // Makes env variables available across the app
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: DbConfig.db.host,
      port: DbConfig.db.port,
      username: DbConfig.db.userName,
      password: DbConfig.db.password,
      database: DbConfig.db.name,
      autoLoadEntities: true
      // synchronize: true, // Use only in development
    }),
    ContactsGroupsModule,
    SettingsModule,
    GroupEntityModule,
    ContactsStatusModule
  ],
  controllers: [
    AppController,
    AdministratorsController,
    AttachmentsController,
    ContactsController,
    ContactsGroupsControllerV1,
    PagesControllerV1,
    SettingsController,
    TemplatesController,
    ContactsStatusController,
    AdministratorGroupsController
  ],
  providers: [
    AppService,
    ContactsService,
    AdministratorsService,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard
    },
    TemplatesService,
    AttachmentsService,
    SettingsService,
    PagesService,
    ContactsStatusService,
    AdministratorGroupsService
  ]
})
export class AppModule {}
