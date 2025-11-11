import { Module } from '@nestjs/common';
import { SupervisorRequestsService } from './supervisor-requests.service';

import { DatabaseModule } from '../database/database.module';
import { SupervisorRequestsController } from './supervisor-requests.controller';

@Module({
    imports:[DatabaseModule],
    controllers:[SupervisorRequestsController],
    providers:[SupervisorRequestsService],

})
export class SupervisorRequestsModule {}
