import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { XapiService } from './xapi.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

type JwtUser = { userId: string; role: Role; teamId: string };

@Controller('xapi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class XapiController {
  constructor(private readonly xapiService: XapiService) {}

  @Get('export')
  @Roles(Role.learner)
  exportMine(@CurrentUser() user: JwtUser) {
    return this.xapiService.exportForUser(user.userId);
  }

  @Get('export/team')
  @Roles(Role.manager)
  exportTeam(@CurrentUser() user: JwtUser) {
    return this.xapiService.exportForTeam(user.teamId);
  }
}
