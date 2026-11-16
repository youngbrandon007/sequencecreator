import type { Awareness } from 'y-protocols/awareness';
import type { WebSocket } from 'ws';
import type * as Y from 'yjs';

export type RoomState = {
  code: string;
  doc: Y.Doc;
  awareness: Awareness;
  conns: Map<WebSocket, Set<number>>;
  unbindPersistence: () => void;
  unbindBroadcast: () => void;
};
