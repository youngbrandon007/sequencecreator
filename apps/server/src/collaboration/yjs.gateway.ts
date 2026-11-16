import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { WebSocketServer, type WebSocket } from 'ws';
import {
  isValidJoinCode,
  normalizeJoinCode,
} from '../common/utils/alphabet';
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
        this.reject(socket, 400, 'Bad Request');
        return;
      }

      try {
        await this.sessions.assertExists(code);
      } catch {
        this.reject(socket, 404, 'Not Found');
        return;
      }

      // Load the room BEFORE finishing the WS handshake so the client's
      // immediate sync step-1 is not dropped (no handler yet).
      const room = await this.rooms.getOrLoad(code);

      if (!this.wss) {
        this.reject(socket, 503, 'Service Unavailable');
        return;
      }

      if (socket.destroyed) {
        return;
      }

      this.wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        this.connections.attach(ws, room);
        this.logger.debug(
          `Client connected to ${code} (${room.conns.size} total)`,
        );
      });
    } catch (err) {
      this.logger.error(
        'WebSocket upgrade failed',
        err instanceof Error ? err.stack : String(err),
      );
      this.reject(socket, 500, 'Internal Server Error');
    }
  }

  private reject(socket: Duplex, status: number, reason: string): void {
    try {
      socket.write(`HTTP/1.1 ${status} ${reason}\r\nConnection: close\r\n\r\n`);
    } catch {
      // ignore
    }
    socket.destroy();
  }
}
