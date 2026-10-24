import { Injectable, OnModuleInit } from '@nestjs/common';
import { Content, Prisma, Technique } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { FALLBACK_CONTENTS } from './fallback.js';

export type LearnerContent = {
  id: string;
  title: string;
  body: string;
  senderName: string;
  difficulty: number;
  createdAt: Date;
};

@Injectable()
export class ContentsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.content.count();
    if (count === 0) {
      await this.seedFallback();
    }
  }

  async getNextForLearner(userId: string) {
    const content = await this.prisma.content.findFirst({
      where: {
        status: 'ready',
        answers: { none: { userId } },
      },
      orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
    });

    if (!content) {
      return { content: null, remaining: 0 };
    }

    const remaining = await this.prisma.content.count({
      where: {
        status: 'ready',
        answers: { none: { userId } },
      },
    });

    return { content: this.toLearnerContent(content), remaining };
  }

  async listAll() {
    return this.prisma.content.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: { _count: { select: { answers: true } } },
    });
  }

  async seedFallback() {
    let created = 0;

    for (const fallback of FALLBACK_CONTENTS) {
      const existing = await this.prisma.content.findFirst({
        where: { title: fallback.title, source: 'fallback' },
        select: { id: true },
      });
      if (existing) continue;

      await this.prisma.content.create({
        data: {
          title: fallback.title,
          body: fallback.body,
          senderName: fallback.senderName,
          isReliable: fallback.isReliable,
          technique: fallback.technique as Technique,
          difficulty: fallback.difficulty,
          highlights: fallback.highlights as unknown as Prisma.InputJsonValue,
          explanation: fallback.explanation,
          source: 'fallback',
          status: 'ready',
        },
      });
      created++;
    }

    return { created, total: FALLBACK_CONTENTS.length };
  }

  toLearnerContent(content: Content): LearnerContent {
    return {
      id: content.id,
      title: content.title,
      body: content.body,
      senderName: content.senderName,
      difficulty: content.difficulty,
      createdAt: content.createdAt,
    };
  }
}
