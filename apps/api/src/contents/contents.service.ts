import { Injectable, OnModuleInit } from '@nestjs/common';
import { Content, Prisma, Technique } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { FALLBACK_CONTENTS } from './fallback.js';
import { EloService } from '../answers/elo.service.js';

export type LearnerContent = {
  id: string;
  title: string;
  body: string;
  senderName: string;
  difficulty: number;
  createdAt: Date;
};

const MANIPULATION_TECHNIQUES: Technique[] = [
  'deformed_statistic',
  'invented_quote',
  'fake_urgency',
  'dubious_source',
  'spoofed_sender',
];

@Injectable()
export class ContentsService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly elo: EloService,
  ) {}

  async onModuleInit() {
    const count = await this.prisma.content.count();
    if (count === 0) {
      await this.seedFallback();
    }
  }

  private difficultyForRating(rating: number): number {
    if (rating < 950) return 3;
    if (rating > 1050) return 1;
    return 2;
  }

  async getNextForLearner(userId: string) {
    const weakest = await this.elo.getWeakestTechnique(userId);
    const ratings = await this.prisma.skillRating.findUnique({
      where: { userId_technique: { userId, technique: weakest } },
      select: { rating: true },
    });
    const targetDifficulty = this.difficultyForRating(ratings?.rating ?? 1000);

    const seen = await this.prisma.answer.findMany({
      where: { userId },
      select: { contentId: true },
    });
    const seenIds = seen.map((s) => s.contentId);

    const baseWhere = {
      status: 'ready' as const,
      id: { notIn: seenIds },
    };

    const roll = Math.random();
    const wantsReliable = roll < 0.3;

    let content: Content | null = null;

    if (wantsReliable) {
      content = await this.prisma.content.findFirst({
        where: { ...baseWhere, isReliable: true },
        orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
      });
    }

    if (!content && weakest !== 'none') {
      content = await this.prisma.content.findFirst({
        where: { ...baseWhere, isReliable: false, technique: weakest },
        orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
      });
    }

    if (!content && weakest !== 'none') {
      const others = MANIPULATION_TECHNIQUES.filter((t) => t !== weakest);
      content = await this.prisma.content.findFirst({
        where: { ...baseWhere, isReliable: false, technique: { in: others } },
        orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
      });
    }

    if (!content) {
      content = await this.prisma.content.findFirst({
        where: { ...baseWhere, isReliable: false },
        orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
      });
    }

    if (!content) {
      content = await this.prisma.content.findFirst({
        where: baseWhere,
        orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
      });
    }

    if (!content) {
      content = await this.prisma.content.findFirst({
        where: { status: 'ready', answers: { none: { userId } } },
        orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
      });
    }

    if (!content) {
      return { content: null, remaining: 0 };
    }

    const remaining = await this.prisma.content.count({
      where: {
        status: 'ready',
        id: { notIn: [...seenIds, content.id] },
      },
    });

    return { content: this.toLearnerContent(content), remaining: remaining + 0 };
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
