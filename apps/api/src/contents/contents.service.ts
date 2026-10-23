import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { FALLBACK_CONTENTS } from './fallback.js';

@Injectable()
export class ContentsService {
  constructor(private prisma: PrismaService) {}

  async getNextForLearner(userId: string) {
    // Pour l'instant, on prend un contenu depuis la banque de secours
    // et on le crée dans la base s'il n'existe pas déjà
    const existing = await this.prisma.content.findFirst({
      where: { status: 'ready' },
      orderBy: { createdAt: 'asc' },
    });

    if (existing) {
      return existing;
    }

    // Créer un contenu à partir de la banque de secours
    const fallback = FALLBACK_CONTENTS.find((c) => !c.isReliable) || FALLBACK_CONTENTS[0];
    return this.prisma.content.create({
      data: {
        title: fallback.title,
        body: fallback.body,
        senderName: fallback.senderName,
        isReliable: fallback.isReliable,
        technique: fallback.technique as any,
        difficulty: fallback.difficulty,
        highlights: fallback.highlights as any,
        explanation: fallback.explanation,
        source: 'fallback',
        status: 'ready',
      },
    });
  }

  async listAll() {
    return this.prisma.content.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
