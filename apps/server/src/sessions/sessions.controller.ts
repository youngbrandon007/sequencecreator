import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { ParseJoinCodePipe } from '../common/pipes/parse-join-code.pipe';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionsService } from './sessions.service';

@Controller('api/sessions')
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessions.create(dto);
  }

  @Get(':code')
  findOne(@Param('code', ParseJoinCodePipe) code: string) {
    return this.sessions.findOne(code);
  }

  @Delete(':code')
  @HttpCode(204)
  async remove(@Param('code', ParseJoinCodePipe) code: string): Promise<void> {
    await this.sessions.remove(code);
  }
}
