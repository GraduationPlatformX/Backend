import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
