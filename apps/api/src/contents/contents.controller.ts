import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ContentsService } from './contents.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

type JwtUser = { userId: string; role: Role };

@Controller('contents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Get('next')
  @Roles(Role.learner)
  getNext(@CurrentUser() user: JwtUser) {
    return this.contentsService.getNextForLearner(user.userId);
  }

  @Get()
  @Roles(Role.manager)
  list() {
    return this.contentsService.listAll();
  }

  @Post('seed-fallback')
  @Roles(Role.manager)
  seedFallback() {
    return this.contentsService.seedFallback();
  }
}
