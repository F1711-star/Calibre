import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth.module.js';
import { UsersModule } from './users.module.js';
import { TeamsModule } from './teams.module.js';
import { ContentsModule } from './contents.module.js';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, TeamsModule, ContentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
