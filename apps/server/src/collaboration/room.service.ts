import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as encoding from 'lib0/encoding';
import {
  Awareness,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from 'y-protocols/awareness';
import * as syncProtocol from 'y-protocols/sync';
import type { WebSocket } from 'ws';
import { YdocStoreService } from '../persistence/ydoc-store.service';
import type { RoomState } from './types/room-state';

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;

@Injectable()
export class RoomService implements OnModuleDestroy {
  private readonly logger = new Logger(RoomService.name);
  private readonly rooms = new Map<string, RoomState>();
  private readonly loading = new Map<string, Promise<RoomState>>();

  constructor(private readonly ydocStore: YdocStoreService) {}

  async getOrLoad(code: string): Promise<RoomState> {
    const existing = this.rooms.get(code);
    if (existing) {
      return existing;
    }

    const inflight = this.loading.get(code);
    if (inflight) {
      return inflight;
    }

    const pending = this.createRoom(code)
      .then((room) => {
        this.rooms.set(code, room);
        return room;
      })
      .finally(() => {
        this.loading.delete(code);
      });
    this.loading.set(code, pending);
    return pending;
  }

  private async createRoom(code: string): Promise<RoomState> {
    const doc = await this.ydocStore.loadDoc(code);
    const awareness = new Awareness(doc);
    const conns = new Map<WebSocket, Set<number>>();
    const unbindPersistence = this.ydocStore.bindPersistence(code, doc);

    const docUpdateHandler = (update: Uint8Array, origin: unknown) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_SYNC);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);
      this.broadcast(conns, message, origin instanceof Object ? origin : null);
    };

    const awarenessChangeHandler = (
      {
        added,
        updated,
        removed,
      }: { added: number[]; updated: number[]; removed: number[] },
      origin: unknown,
    ) => {
      const changed = added.concat(updated, removed);
      if (origin != null && conns.has(origin as WebSocket)) {
        const controlled = conns.get(origin as WebSocket)!;
        added.forEach((id) => controlled.add(id));
        removed.forEach((id) => controlled.delete(id));
      }

      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(
        encoder,
        encodeAwarenessUpdate(awareness, changed),
      );
      this.broadcast(
        conns,
        encoding.toUint8Array(encoder),
        origin instanceof Object ? origin : null,
      );
    };

    doc.on('update', docUpdateHandler);
    awareness.on('update', awarenessChangeHandler);

    const room: RoomState = {
      code,
      doc,
      awareness,
      conns,
      unbindPersistence,
      unbindBroadcast: () => {
        doc.off('update', docUpdateHandler);
        awareness.off('update', awarenessChangeHandler);
      },
    };
    this.logger.debug(`Loaded room ${code}`);
    return room;
  }

  get(code: string): RoomState | undefined {
    return this.rooms.get(code);
  }

  async releaseIfEmpty(code: string): Promise<void> {
    const room = this.rooms.get(code);
    if (!room || room.conns.size > 0) {
      return;
    }

    try {
      await this.ydocStore.saveSnapshot(code, room.doc);
    } catch (err) {
      this.logger.error(
        `Failed to snapshot room ${code} on close`,
        err instanceof Error ? err.stack : String(err),
      );
    }

    room.unbindBroadcast();
    room.unbindPersistence();
    room.awareness.destroy();
    room.doc.destroy();
    this.rooms.delete(code);
    this.logger.debug(`Unloaded room ${code}`);
  }

  removeConnection(room: RoomState, ws: WebSocket): void {
    const controlledIds = room.conns.get(ws);
    room.conns.delete(ws);
    if (controlledIds && controlledIds.size > 0) {
      removeAwarenessStates(room.awareness, [...controlledIds], null);
    }
    void this.releaseIfEmpty(room.code);
  }

  /** Force-close an in-memory room without persisting (e.g. HTTP delete). */
  dispose(code: string): void {
    const room = this.rooms.get(code);
    if (!room) {
      return;
    }
    for (const ws of [...room.conns.keys()]) {
      try {
        ws.close(1000, 'session deleted');
      } catch {
        // ignore
      }
    }
    room.conns.clear();
    room.unbindBroadcast();
    room.unbindPersistence();
    room.awareness.destroy();
    room.doc.destroy();
    this.rooms.delete(code);
    this.logger.debug(`Disposed room ${code}`);
  }

  async onModuleDestroy(): Promise<void> {
    const codes = [...this.rooms.keys()];
    for (const code of codes) {
      const room = this.rooms.get(code);
      if (!room) continue;
      try {
        await this.ydocStore.saveSnapshot(code, room.doc);
      } catch (err) {
        this.logger.error(
          `Failed to snapshot room ${code} on shutdown`,
          err instanceof Error ? err.stack : String(err),
        );
      }
      room.unbindBroadcast();
      room.unbindPersistence();
      for (const ws of room.conns.keys()) {
        try {
          ws.close();
        } catch {
          // ignore
        }
      }
      room.awareness.destroy();
      room.doc.destroy();
      this.rooms.delete(code);
    }
  }

  private broadcast(
    conns: Map<WebSocket, Set<number>>,
    message: Uint8Array,
    except: unknown,
  ): void {
    for (const client of conns.keys()) {
      if (client === except || client.readyState !== client.OPEN) {
        continue;
      }
      try {
        client.send(message, { binary: true });
      } catch {
        // closed elsewhere
      }
    }
  }
}
