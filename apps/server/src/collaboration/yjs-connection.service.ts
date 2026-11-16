import { Injectable, Logger } from '@nestjs/common';
import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import {
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
} from 'y-protocols/awareness';
import * as syncProtocol from 'y-protocols/sync';
import type { RawData, WebSocket } from 'ws';
import { RoomService } from './room.service';
import type { RoomState } from './types/room-state';

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;
const MESSAGE_QUERY_AWARENESS = 3;

@Injectable()
export class YjsConnectionService {
  private readonly logger = new Logger(YjsConnectionService.name);

  constructor(private readonly rooms: RoomService) {}

  attach(ws: WebSocket, room: RoomState): void {
    room.conns.set(ws, new Set());

    const send = (data: Uint8Array) => {
      if (ws.readyState !== ws.OPEN) {
        return;
      }
      try {
        ws.send(data, { binary: true });
      } catch (err) {
        this.logger.warn(
          `Send failed for ${room.code}`,
          err instanceof Error ? err.message : String(err),
        );
        closeConn();
      }
    };

    let closed = false;
    const closeConn = () => {
      if (closed) return;
      closed = true;
      ws.off('message', onMessage);
      ws.off('close', closeConn);
      ws.off('error', closeConn);
      this.rooms.removeConnection(room, ws);
      try {
        ws.close();
      } catch {
        // ignore
      }
    };

    const onMessage = (raw: RawData) => {
      try {
        const data = toUint8Array(raw);
        const decoder = decoding.createDecoder(data);
        const messageType = decoding.readVarUint(decoder);

        switch (messageType) {
          case MESSAGE_SYNC: {
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, MESSAGE_SYNC);
            // Origin = this socket so room broadcast skips echoing back here.
            syncProtocol.readSyncMessage(decoder, encoder, room.doc, ws);
            if (encoding.length(encoder) > 1) {
              send(encoding.toUint8Array(encoder));
            }
            break;
          }
          case MESSAGE_AWARENESS: {
            applyAwarenessUpdate(
              room.awareness,
              decoding.readVarUint8Array(decoder),
              ws,
            );
            break;
          }
          case MESSAGE_QUERY_AWARENESS: {
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
            encoding.writeVarUint8Array(
              encoder,
              encodeAwarenessUpdate(room.awareness, [
                ...room.awareness.getStates().keys(),
              ]),
            );
            send(encoding.toUint8Array(encoder));
            break;
          }
          default:
            this.logger.warn(
              `Unknown yjs message type ${messageType} in ${room.code}`,
            );
        }
      } catch (err) {
        this.logger.warn(
          `Bad yjs message in ${room.code}`,
          err instanceof Error ? err.message : String(err),
        );
        closeConn();
      }
    };

    ws.on('message', onMessage);
    ws.on('close', closeConn);
    ws.on('error', closeConn);

    // Sync step 1
    {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_SYNC);
      syncProtocol.writeSyncStep1(encoder, room.doc);
      send(encoding.toUint8Array(encoder));
    }

    // Current awareness states
    const awarenessStates = room.awareness.getStates();
    if (awarenessStates.size > 0) {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(
        encoder,
        encodeAwarenessUpdate(room.awareness, [...awarenessStates.keys()]),
      );
      send(encoding.toUint8Array(encoder));
    }
  }
}

function toUint8Array(raw: RawData): Uint8Array {
  if (raw instanceof ArrayBuffer) {
    return new Uint8Array(raw);
  }
  if (Array.isArray(raw)) {
    return new Uint8Array(Buffer.concat(raw));
  }
  return new Uint8Array(raw);
}
