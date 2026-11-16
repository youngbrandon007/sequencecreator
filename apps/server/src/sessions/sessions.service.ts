import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { RoomService } from '../collaboration/room.service';
import { PrismaService } from '../persistence/prisma.service';
import type { CreateSessionDto } from './dto/create-session.dto';
import type { SessionResponseDto } from './dto/session-response.dto';
import { JoinCodeService } from './join-code.service';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly joinCodes: JoinCodeService,
    @Inject(forwardRef(() => RoomService))
    private readonly rooms: RoomService,
  ) {}

  async create(dto: CreateSessionDto): Promise<SessionResponseDto> {
    const code = await this.joinCodes.generateUnique();
    const session = await this.prisma.session.create({
      data: {
        code,
        title: dto.title?.trim() || null,
      },
    });
    return this.toDto(session);
  }

  async findOne(code: string): Promise<SessionResponseDto> {
    const session = await this.prisma.session.findUnique({ where: { code } });
    if (!session) {
      throw new NotFoundException(`Session ${code} not found`);
    }
    return this.toDto(session);
  }

  async assertExists(code: string): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { code },
      select: { code: true },
    });
    if (!session) {
      throw new NotFoundException(`Session ${code} not found`);
    }
  }

  async remove(code: string): Promise<void> {
    this.rooms.dispose(code);
    try {
      await this.prisma.session.delete({ where: { code } });
    } catch {
      throw new NotFoundException(`Session ${code} not found`);
    }
  }

  private toDto(session: {
    code: string;
    title: string | null;
    createdAt: Date;
    lastActiveAt: Date;
  }): SessionResponseDto {
    return {
      code: session.code,
      title: session.title,
      createdAt: session.createdAt,
      lastActiveAt: session.lastActiveAt,
    };
  }
}
