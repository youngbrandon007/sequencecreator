import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CollaborationModule } from './collaboration/collaboration.module';
import configuration from './config/configuration';
import { HealthModule } from './health/health.module';
import { PersistenceModule } from './persistence/persistence.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    PersistenceModule,
    SessionsModule,
    CollaborationModule,
    HealthModule,
  ],
})
export class AppModule {}
