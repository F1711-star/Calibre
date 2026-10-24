import { Module } from '@nestjs/common';
import { ContentsController } from './contents.controller.js';
import { ContentsService } from './contents.service.js';
import { EloService } from '../answers/elo.service.js';

@Module({
  controllers: [ContentsController],
  providers: [ContentsService, EloService],
  exports: [ContentsService],
})
export class ContentsModule {}
