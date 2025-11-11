import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { SupabaseService } from 'src/common/services';

@Module({
  providers: [StorageService, SupabaseService],
  exports: [StorageService],
})
export class StorageModule {}
