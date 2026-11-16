import { Module, forwardRef } from '@nestjs/common';
import { SessionsModule } from '../sessions/sessions.module';
import { RoomService } from './room.service';
import { YjsConnectionService } from './yjs-connection.service';
import { YjsGateway } from './yjs.gateway';

@Module({
  imports: [forwardRef(() => SessionsModule)],
  providers: [RoomService, YjsConnectionService, YjsGateway],
  exports: [RoomService],
})
export class CollaborationModule {}
