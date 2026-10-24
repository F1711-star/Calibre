import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Technique } from '@prisma/client';

const DEFAULT_RATING = 1000;
const K = 32;

function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

function difficultyToRating(difficulty: number): number {
  if (difficulty <= 1) return 900;
  if (difficulty >= 3) return 1100;
  return 1000;
}

@Injectable()
export class EloService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureRatings(userId: string) {
    const existing = await this.prisma.skillRating.findMany({
      where: { userId },
      select: { technique: true },
    });
    const have = new Set(existing.map((row) => row.technique));
    const all: Technique[] = [
      'none',
      'deformed_statistic',
      'invented_quote',
      'fake_urgency',
      'dubious_source',
      'spoofed_sender',
    ];
    const missing = all.filter((technique) => !have.has(technique));

    if (missing.length === 0) return;

    await this.prisma.skillRating.createMany({
      data: missing.map((technique) => ({
        userId,
        technique,
        rating: DEFAULT_RATING,
      })),
      skipDuplicates: true,
    });
  }

  async updateAfterAnswer(userId: string, technique: Technique, difficulty: number, success: boolean) {
    await this.ensureRatings(userId);

    const rating = await this.prisma.skillRating.findUnique({
      where: { userId_technique: { userId, technique } },
      select: { rating: true },
    });

    const current = rating?.rating ?? DEFAULT_RATING;
    const opponent = difficultyToRating(difficulty);
    const expected = expectedScore(current, opponent);
    const result = success ? 1 : 0;
    const next = Math.round(current + K * (result - expected));

    await this.prisma.skillRating.update({
      where: { userId_technique: { userId, technique } },
      data: { rating: Math.max(400, Math.min(1600, next)) },
    });
  }

  async getWeakestTechnique(userId: string): Promise<Technique> {
    await this.ensureRatings(userId);
    const ratings = await this.prisma.skillRating.findMany({
      where: { userId },
      orderBy: { rating: 'asc' },
    });
    const first = ratings.find((row) => row.technique !== 'none');
    return (first?.technique as Technique) ?? 'fake_urgency';
  }
}
