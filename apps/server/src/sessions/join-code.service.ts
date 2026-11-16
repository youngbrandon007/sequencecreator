import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import type { AppConfig } from '../config/configuration';
import { JOIN_CODE_ALPHABET } from '../common/utils/alphabet';
import { PrismaService } from '../persistence/prisma.service';

@Injectable()
export class JoinCodeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async generateUnique(): Promise<string> {
    const length = this.config.get('joinCodeLength', { infer: true });

    for (let attempt = 0; attempt < 20; attempt++) {
      const code = this.randomCode(length);
      const existing = await this.prisma.session.findUnique({
        where: { code },
        select: { code: true },
      });
      if (!existing) {
        return code;
      }
    }

    throw new Error('Unable to allocate a unique join code');
  }

  private randomCode(length: number): string {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += JOIN_CODE_ALPHABET[randomInt(JOIN_CODE_ALPHABET.length)];
    }
    return code;
  }
}
