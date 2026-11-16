import { Injectable, Logger } from '@nestjs/common';
import * as Y from 'yjs';
import { PrismaService } from './prisma.service';

@Injectable()
export class CompactionService {
  private readonly logger = new Logger(CompactionService.name);
  private readonly inflight = new Set<string>();

  constructor(private readonly prisma: PrismaService) {}

  async compact(code: string): Promise<void> {
    if (this.inflight.has(code)) {
      return;
    }
    this.inflight.add(code);
    try {
      const doc = new Y.Doc();
      const snapshot = await this.prisma.ySnapshot.findUnique({
        where: { code },
      });
      if (snapshot) {
        Y.applyUpdate(doc, new Uint8Array(snapshot.data));
      }
      const updates = await this.prisma.yUpdate.findMany({
        where: { code },
        orderBy: { id: 'asc' },
      });
      for (const update of updates) {
        Y.applyUpdate(doc, new Uint8Array(update.data));
      }
      await this.compactFromDoc(code, doc);
      doc.destroy();
    } finally {
      this.inflight.delete(code);
    }
  }

  async compactFromDoc(code: string, doc: Y.Doc): Promise<void> {
    const state = Y.encodeStateAsUpdate(doc);
    await this.prisma.$transaction([
      this.prisma.ySnapshot.upsert({
        where: { code },
        create: { code, data: Buffer.from(state) },
        update: { data: Buffer.from(state) },
      }),
      this.prisma.yUpdate.deleteMany({ where: { code } }),
    ]);
    this.logger.debug(`Compacted session ${code}`);
  }
}
