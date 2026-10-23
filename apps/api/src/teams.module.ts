import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service.js';

@Module({
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
