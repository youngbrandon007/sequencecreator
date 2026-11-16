import { Module } from '@nestjs/common';
import { ParseJoinCodePipe } from '../common/pipes/parse-join-code.pipe';
import { JoinCodeService } from './join-code.service';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService, JoinCodeService, ParseJoinCodePipe],
  exports: [SessionsService],
})
export class SessionsModule {}
