import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { AppConfig } from '../config/configuration';
import { PrismaService } from './prisma.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeIdleSessions(): Promise<void> {
    const days = this.config.get('idleTtlDays', { infer: true });
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await this.prisma.session.deleteMany({
      where: { lastActiveAt: { lt: cutoff } },
    });
    if (result.count > 0) {
      this.logger.log(
        `Purged ${result.count} idle session(s) older than ${days} day(s)`,
      );
    }
  }
}
