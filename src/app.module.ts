import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { GroupsModule } from './modules/groups/groups.module';
import { SupervisorRequestsModule } from './modules/supervisor-requests/supervisor-requests.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { MilestonesModule } from './modules/milestones/milestones.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { GroupChatsModule } from './modules/group-chats/group-chats.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { KeepAliveService } from './keep-alive.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    AuthModule,
    DatabaseModule,
    GroupsModule,
    SupervisorRequestsModule,
    UsersModule,
    ProjectsModule,
    MilestonesModule,
    SubmissionsModule,
    NotificationsModule,
    GroupChatsModule,
  ],
  providers:[AppService,KeepAliveService],
  controllers:[AppController]

})
export class AppModule {}
