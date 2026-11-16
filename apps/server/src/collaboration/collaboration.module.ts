import { Module } from '@nestjs/common';
import { SessionsModule } from '../sessions/sessions.module';
import { RoomService } from './room.service';
import { YjsConnectionService } from './yjs-connection.service';
import { YjsGateway } from './yjs.gateway';

@Module({
  imports: [SessionsModule],
  providers: [RoomService, YjsConnectionService, YjsGateway],
})
export class CollaborationModule {}
