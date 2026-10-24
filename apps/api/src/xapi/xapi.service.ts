import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Answer, Content } from '@prisma/client';

@Injectable()
export class XapiService {
  constructor(private readonly prisma: PrismaService) {}

  async recordAnswer(user: { id: string; teamId: string }, answer: Answer, content: Content) {
    const actor = {
      objectType: 'Agent',
      account: {
        name: user.id,
        homePage: 'https://calibre.test',
      },
    };

    const verb = {
      id: 'http://adlnet.gov/expapi/verbs/answered',
      display: { 'en-US': 'answered', 'fr-FR': 'a répondu' },
    };

    const object = {
      objectType: 'Activity',
      id: `https://calibre.test/contents/${content.id}`,
      definition: {
        name: { 'fr-FR': content.title },
        description: { 'fr-FR': 'Exercice de détection de contenu manipulé' },
      },
    };

    const success = answer.verdictCorrect && answer.techniqueCorrect;
    const statement = {
      id: answer.id,
      actor,
      verb,
      object,
      result: {
        success,
        score: {
          scaled: (answer.explanationScore ?? 0) / 100,
          raw: answer.explanationScore ?? 0,
          min: 0,
          max: 100,
        },
        response: JSON.stringify({
          verdict: answer.verdict,
          technique: answer.technique,
        }),
        completion: true,
      },
      context: {
        contextActivities: {
          group: [
            {
              objectType: 'Group',
              id: `https://calibre.test/teams/${user.teamId}`,
              name: { 'fr-FR': user.teamId },
            },
          ],
        },
        extensions: {
          'https://calibre.test/extensions/teamId': user.teamId,
          'https://calibre.test/extensions/contentId': content.id,
          'https://calibre.test/extensions/difficulty': content.difficulty,
          'https://calibre.test/extensions/isReliable': content.isReliable,
          'https://calibre.test/extensions/technique': content.technique,
        },
      },
      timestamp: answer.createdAt.toISOString(),
    };

    await this.prisma.xapiStatement.create({
      data: {
        userId: user.id,
        answerId: answer.id,
        statement: statement as any,
      },
    });

    return statement;
  }

  async exportForUser(userId: string) {
    return this.prisma.xapiStatement.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { statement: true, createdAt: true },
    });
  }

  async exportForTeam(teamId: string) {
    const users = await this.prisma.user.findMany({
      where: { teamId },
      select: { id: true },
    });
    const userIds = users.map((user) => user.id);
    return this.prisma.xapiStatement.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: 'asc' },
      select: { statement: true, createdAt: true, userId: true },
    });
  }
}
