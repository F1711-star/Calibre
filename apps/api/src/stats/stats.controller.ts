import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { StatsService } from './stats.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

type JwtUser = { userId: string; role: Role; teamId: string };

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('team')
  @Roles(Role.manager)
  getTeam(@CurrentUser() user: JwtUser) {
    return this.statsService.getTeamDashboard(user.teamId);
  }
}
