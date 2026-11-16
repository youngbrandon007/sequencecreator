import { Global, Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { CompactionService } from './compaction.service';
import { PrismaService } from './prisma.service';
import { YdocStoreService } from './ydoc-store.service';

@Global()
@Module({
  providers: [
    PrismaService,
    CompactionService,
    YdocStoreService,
    CleanupService,
  ],
  exports: [PrismaService, CompactionService, YdocStoreService],
})
export class PersistenceModule {}
