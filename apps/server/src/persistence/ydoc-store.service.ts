import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Y from 'yjs';
import type { AppConfig } from '../config/configuration';
import { CompactionService } from './compaction.service';
import { PrismaService } from './prisma.service';

@Injectable()
export class YdocStoreService {
  private readonly logger = new Logger(YdocStoreService.name);
  /** Serialize persist writes per session so unload can await a flush. */
  private readonly writeChains = new Map<string, Promise<void>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly compaction: CompactionService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async loadDoc(code: string): Promise<Y.Doc> {
    const doc = new Y.Doc();
    const snapshot = await this.prisma.ySnapshot.findUnique({
      where: { code },
    });
    if (snapshot) {
      Y.applyUpdate(doc, new Uint8Array(snapshot.data), 'ydoc-store-load');
    }

    const updates = await this.prisma.yUpdate.findMany({
      where: { code },
      orderBy: { id: 'asc' },
    });
    for (const update of updates) {
      Y.applyUpdate(doc, new Uint8Array(update.data), 'ydoc-store-load');
    }

    return doc;
  }

  async storeUpdate(code: string, update: Uint8Array): Promise<void> {
    await this.prisma.yUpdate.create({
      data: {
        code,
        data: Buffer.from(update),
      },
    });
    await this.prisma.session.update({
      where: { code },
      data: { lastActiveAt: new Date() },
    });

    const pending = await this.prisma.yUpdate.count({ where: { code } });
    const threshold = this.config.get('compactEveryNUpdates', { infer: true });
    if (pending >= threshold) {
      await this.compaction.compact(code);
    }
  }

  async saveSnapshot(code: string, doc: Y.Doc): Promise<void> {
    await this.flush(code);
    await this.compaction.compactFromDoc(code, doc);
  }

  async flush(code: string): Promise<void> {
    const chain = this.writeChains.get(code) ?? Promise.resolve();
    await chain.catch(() => undefined);
  }

  bindPersistence(code: string, doc: Y.Doc): () => void {
    const handler = (update: Uint8Array, origin: unknown) => {
      if (origin === 'ydoc-store-load') {
        return;
      }
      const previous = this.writeChains.get(code) ?? Promise.resolve();
      const next = previous
        .catch(() => undefined)
        .then(() => this.storeUpdate(code, update))
        .catch((err: unknown) => {
          this.logger.error(
            `Failed to persist update for ${code}`,
            err instanceof Error ? err.stack : String(err),
          );
        });
      this.writeChains.set(code, next);
    };
    doc.on('update', handler);
    return () => {
      doc.off('update', handler);
    };
  }
}
