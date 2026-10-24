import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AnswersService } from './answers.service.js';
import { AnswerThrottleGuard } from './answer-throttle.guard.js';
import { CreateAnswerDto } from './dto/create-answer.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

type JwtUser = { userId: string; role: Role };

@Controller('answers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  @Roles(Role.learner)
  @UseGuards(AnswerThrottleGuard)
  submit(@CurrentUser() user: JwtUser, @Body() dto: CreateAnswerDto) {
    return this.answersService.submit(user.userId, dto);
  }

  @Get('mine')
  @Roles(Role.learner)
  listMine(@CurrentUser() user: JwtUser) {
    return this.answersService.listMine(user.userId);
  }

  @Get(':id')
  @Roles(Role.learner)
  getById(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.answersService.getById(user.userId, id);
  }
}
