import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ContentsService } from './contents.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Role } from '@prisma/client';

@Controller('contents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentsController {
  constructor(private contentsService: ContentsService) {}

  @Get('next')
  @Roles(Role.learner)
  getNext(@CurrentUser() user: any) {
    return this.contentsService.getNextForLearner(user.userId);
  }

  @Get()
  @Roles(Role.manager)
  list() {
    return this.contentsService.listAll();
  }

  @Post('seed-fallback')
  @Roles(Role.manager)
  async seedFallback() {
    let created = 0;
    for (const f of (await import('./fallback.js')).FALLBACK_CONTENTS) {
      const exists = await (this.contentsService as any).prisma.content.findFirst({
        where: { title: f.title },
      });
      if (exists) continue;
      await (this.contentsService as any).prisma.content.create({
        data: {
          title: f.title,
          body: f.body,
          senderName: f.senderName,
          isReliable: f.isReliable,
          technique: f.technique,
          difficulty: f.difficulty,
          highlights: f.highlights,
          explanation: f.explanation,
          source: 'fallback',
          status: 'ready',
        },
      });
      created++;
    }
    return { created };
  }
}
