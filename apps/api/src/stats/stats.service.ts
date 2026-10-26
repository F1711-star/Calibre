import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Technique } from '@prisma/client';

const TECHNIQUES: Technique[] = [
  'none',
  'deformed_statistic',
  'invented_quote',
  'fake_urgency',
  'dubious_source',
  'spoofed_sender',
];

type HeatmapCell = {
  technique: Technique;
  totalAnswers: number;
  correct: number;
  rate: number;
};

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeamDashboard(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        users: {
          select: { id: true, email: true, role: true },
        },
      },
    });

    if (!team) {
      throw new Error('Équipe introuvable');
    }

    const memberIds = team.users.filter((user) => user.role === 'learner').map((user) => user.id);
    const memberCount = memberIds.length;

    const answers = await this.prisma.answer.findMany({
      where: {
        userId: { in: memberIds },
      },
      select: {
        id: true,
        userId: true,
        verdictCorrect: true,
        techniqueCorrect: true,
        explanationScore: true,
        technique: true,
        createdAt: true,
      },
    });

    const byUser = new Map<string, { count: number; correct: number; totalScore: number }>();
    for (const user of team.users) {
      if (user.role !== 'learner') continue;
      byUser.set(user.id, { count: 0, correct: 0, totalScore: 0 });
    }

    for (const answer of answers) {
      const current = byUser.get(answer.userId);
      if (!current) continue;
      current.count += 1;
      if (answer.verdictCorrect && answer.techniqueCorrect) {
        current.correct += 1;
      }
      current.totalScore += answer.explanationScore ?? 0;
    }

    const topContributors = [...byUser.entries()]
      .map(([userId, stats]) => {
        const user = team.users.find((u) => u.id === userId);
        return {
          userId,
          email: user?.email ?? '',
          answersCount: stats.count,
          correctCount: stats.correct,
          accuracy: stats.count === 0 ? 0 : Math.round((stats.correct / stats.count) * 100),
          averageScore: stats.count === 0 ? 0 : Math.round(stats.totalScore / stats.count),
        };
      })
      .sort(
        (a, b) =>
          b.correctCount - a.correctCount ||
          b.answersCount - a.answersCount ||
          b.accuracy - a.accuracy ||
          a.email.localeCompare(b.email),
      )
      .slice(0, 6);

    const heatmap: HeatmapCell[] = [];
    for (const technique of TECHNIQUES) {
      const relevant = answers.filter((answer) => {
        if (technique === 'none') {
          return answer.technique === 'none';
        }
        return answer.technique === technique;
      });
      const totalAnswers = relevant.length;
      const correct = relevant.filter((answer) => answer.verdictCorrect && answer.techniqueCorrect).length;
      heatmap.push({
        technique,
        totalAnswers,
        correct,
        rate: totalAnswers === 0 ? 0 : Math.round((correct / totalAnswers) * 100),
      });
    }

    let maturityScore: number | null = null;
    const eligible = answers.filter((answer) => answer.verdictCorrect && answer.techniqueCorrect);
    if (memberCount >= 5 && answers.length > 0) {
      const verdictRate = answers.length === 0 ? 0 : eligible.length / answers.length;
      const avgExplanation =
        answers.reduce((sum, answer) => sum + (answer.explanationScore ?? 0), 0) / answers.length / 100;
      const coverage =
        memberCount === 0 ? 0 : Math.min(1, answers.length / (memberCount * 3));
      maturityScore = Math.round((verdictRate * 0.6 + avgExplanation * 0.25 + coverage * 0.15) * 100);
      maturityScore = Math.max(0, Math.min(100, maturityScore));
    }

    return {
      team: {
        id: team.id,
        name: team.name,
        memberCount,
        learnerCount: memberCount,
      },
      totals: {
        answersCount: answers.length,
        correctCount: answers.filter((answer) => answer.verdictCorrect && answer.techniqueCorrect).length,
      },
      heatmap,
      topContributors,
      maturityScore,
      maturityVisible: memberCount >= 5,
      minTeamSizeForMaturity: 5,
    };
  }
}
