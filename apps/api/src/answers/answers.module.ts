import { Module } from '@nestjs/common';
import { AnswersController } from './answers.controller.js';
import { AnswersService } from './answers.service.js';
import { ExplanationGraderService } from './explanation-grader.service.js';
import { AnswerThrottleGuard } from './answer-throttle.guard.js';

@Module({
  controllers: [AnswersController],
  providers: [AnswersService, ExplanationGraderService, AnswerThrottleGuard],
})
export class AnswersModule {}
