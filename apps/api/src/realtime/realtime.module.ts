import { Module } from '@nestjs/common';

import { AuthModule } from '../iam/auth.module';
import { ConnectionRegistryService } from './connection-registry.service';
import { WsAuthGuard } from './guards/ws-auth.guard';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';

@Module({
  imports: [AuthModule],
  providers: [
    ConnectionRegistryService,
    RealtimeGateway,
    RealtimeService,
    WsAuthGuard,
  ],
  exports: [ConnectionRegistryService, RealtimeService],
})
export class RealtimeModule {}
