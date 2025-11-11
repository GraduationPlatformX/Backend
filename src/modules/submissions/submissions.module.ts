import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { StorageService } from '../storage/storage.service';
import { SupabaseService } from 'src/common/services';

@Module({
  imports: [DatabaseModule],
  controllers: [SubmissionsController],
  providers: [SupabaseService,SubmissionsService, StorageService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
