import {
  BadRequestException,
  Inject,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config/configuration';
import { isValidJoinCode, normalizeJoinCode } from '../utils/alphabet';

@Injectable()
export class ParseJoinCodePipe implements PipeTransform<string, string> {
  constructor(
    @Inject(ConfigService) private readonly config: ConfigService<AppConfig, true>,
  ) {}

  transform(value: string): string {
    const code = normalizeJoinCode(value ?? '');
    const length = this.config.get('joinCodeLength', { infer: true });
    if (!isValidJoinCode(code, length)) {
      throw new BadRequestException(
        `Join code must be ${length} characters from A–Z / 2–9 (no 0, O, 1, I)`,
      );
    }
    return code;
  }
}
