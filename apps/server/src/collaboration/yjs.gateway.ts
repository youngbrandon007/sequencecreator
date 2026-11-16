import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { WebSocketServer, type WebSocket } from 'ws';
import {
  isValidJoinCode,
  normalizeJoinCode,
} from '../common/utils/alphabet';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/configuration';
import { SessionsService } from '../sessions/sessions.service';
import { RoomService } from './room.service';
import { YjsConnectionService } from './yjs-connection.service';

@Injectable()
export class YjsGateway implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(YjsGateway.name);
  private wss: WebSocketServer | null = null;
  private upgradeHandler:
    | ((req: IncomingMessage, socket: Duplex, head: Buffer) => void)
    | null = null;

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly sessions: SessionsService,
    private readonly rooms: RoomService,
    private readonly connections: YjsConnectionService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  onModuleInit(): void {
    const httpServer = this.httpAdapterHost.httpAdapter.getHttpServer();
    this.wss = new WebSocketServer({ noServer: true });

    this.upgradeHandler = (request, socket, head) => {
      void this.handleUpgrade(request, socket, head);
    };
    httpServer.on('upgrade', this.upgradeHandler);
    this.logger.log('Yjs WebSocket upgrade handler mounted at /yjs/:code');
  }

  onModuleDestroy(): void {
    const httpServer = this.httpAdapterHost.httpAdapter.getHttpServer();
    if (this.upgradeHandler) {
      httpServer.off('upgrade', this.upgradeHandler);
      this.upgradeHandler = null;
    }
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
  }

  private async handleUpgrade(
    request: IncomingMessage,
    socket: Duplex,
    head: Buffer,
  ): Promise<void> {
    try {
      const host = request.headers.host ?? 'localhost';
      const url = new URL(request.url ?? '/', `http://${host}`);
      const match = url.pathname.match(/^\/yjs\/([^/]+)\/?$/);
      if (!match) {
        return;
      }

      const length = this.config.get('joinCodeLength', { infer: true });
      const code = normalizeJoinCode(match[1]);
      if (!isValidJoinCode(code, length)) {
        socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
        socket.destroy();
        return;
      }

      try {
        await this.sessions.assertExists(code);
      } catch {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
        return;
      }

      if (!this.wss) {
        socket.destroy();
        return;
      }

      this.wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        void this.onConnection(ws, code);
      });
    } catch (err) {
      this.logger.error(
        'WebSocket upgrade failed',
        err instanceof Error ? err.stack : String(err),
      );
      socket.destroy();
    }
  }

  private async onConnection(ws: WebSocket, code: string): Promise<void> {
    try {
      const room = await this.rooms.getOrLoad(code);
      this.connections.attach(ws, room);
      this.logger.debug(
        `Client connected to ${code} (${room.conns.size} total)`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to attach client to ${code}`,
        err instanceof Error ? err.stack : String(err),
      );
      ws.close();
    }
  }
}
