import { Module } from '@nestjs/common';
import { AnswersController } from './answers.controller.js';
import { AnswersService } from './answers.service.js';
import { ExplanationGraderService } from './explanation-grader.service.js';
import { AnswerThrottleGuard } from './answer-throttle.guard.js';
import { EloService } from './elo.service.js';
import { XapiModule } from '../xapi/xapi.module.js';

@Module({
  imports: [XapiModule],
  controllers: [AnswersController],
  providers: [AnswersService, ExplanationGraderService, AnswerThrottleGuard, EloService],
})
export class AnswersModule {}
