import { Module } from '@nestjs/common';
import { GroupChatsService } from './group-chats.service';
import { GroupChatsController } from './group-chats.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [GroupChatsService],
  controllers: [GroupChatsController]
})
export class GroupChatsModule {}
