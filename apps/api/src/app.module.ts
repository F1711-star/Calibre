import './env.js';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth.module.js';
import { UsersModule } from './users.module.js';
import { TeamsModule } from './teams.module.js';
import { ContentsModule } from './contents/contents.module.js';
import { AnswersModule } from './answers/answers.module.js';
import { StatsModule } from './stats/stats.module.js';
import { XapiModule } from './xapi/xapi.module.js';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, TeamsModule, ContentsModule, AnswersModule, StatsModule, XapiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
