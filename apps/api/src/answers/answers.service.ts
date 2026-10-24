import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Answer, Content, Prisma, Technique, Verdict } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAnswerDto, HighlightDto } from './dto/create-answer.dto.js';
import { detectInjection, sanitizeExplanation } from './injection-detector.js';
import { ExplanationFeedback, ExplanationGraderService } from './explanation-grader.service.js';
import { EloService } from './elo.service.js';
import { XapiService } from '../xapi/xapi.service.js';

@Injectable()
export class AnswersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly grader: ExplanationGraderService,
    private readonly elo: EloService,
    private readonly xapi: XapiService,
  ) {}

  async submit(userId: string, dto: CreateAnswerDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, teamId: true },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const content = await this.prisma.content.findUnique({ where: { id: dto.contentId } });
    if (!content || content.status !== 'ready') {
      throw new NotFoundException('Contenu introuvable');
    }

    const explanation = sanitizeExplanation(dto.explanation);
    if (!explanation) {
      throw new BadRequestException("L'explication ne peut pas être vide");
    }

    const highlights = this.normalizeHighlights(content.body, dto.highlights);
    const submittedTechnique: Technique = dto.verdict === 'reliable' ? 'none' : dto.technique;
    const expectedTechnique: Technique = content.isReliable ? 'none' : content.technique;

    const verdictCorrect =
      content.isReliable ? dto.verdict === Verdict.reliable : dto.verdict === Verdict.suspicious;
    const techniqueCorrect = verdictCorrect && submittedTechnique === expectedTechnique;
    const injectionFlag = detectInjection(dto.explanation);

    const feedback = await this.grader.grade({
      content,
      explanation,
      learnerVerdict: dto.verdict,
      learnerTechnique: submittedTechnique,
      injectionFlag,
    });

    const answer = await this.prisma.answer.create({
      data: {
        userId,
        contentId: content.id,
        verdict: dto.verdict,
        technique: submittedTechnique,
        explanation,
        highlights: highlights as unknown as Prisma.InputJsonValue,
        verdictCorrect,
        techniqueCorrect,
        explanationScore: feedback.score,
        explanationFeedback: feedback as unknown as Prisma.InputJsonValue,
        injectionFlag,
      },
    });

    const success = verdictCorrect && techniqueCorrect;
    const targetTechnique: Technique = content.isReliable ? 'none' : content.technique;
    await this.elo.updateAfterAnswer(userId, targetTechnique, content.difficulty, success);
    await this.xapi.recordAnswer(user, answer, content);

    return this.serialize(answer, content, feedback);
  }

  async getById(userId: string, answerId: string) {
    const found = await this.prisma.answer.findFirst({
      where: { id: answerId, userId },
      include: { content: true },
    });
    if (!found) {
      throw new NotFoundException('Réponse introuvable');
    }

    const { content, ...answer } = found;
    const feedback = answer.explanationFeedback as unknown as ExplanationFeedback | null;
    return this.serialize(answer, content, feedback);
  }

  async listMine(userId: string) {
    const answers = await this.prisma.answer.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        verdict: true,
        technique: true,
        verdictCorrect: true,
        techniqueCorrect: true,
        explanationScore: true,
        createdAt: true,
        content: { select: { title: true } },
      },
    });

    const total = answers.length;
    const correct = answers.filter((answer) => answer.verdictCorrect && answer.techniqueCorrect).length;

    return { total, correct, answers };
  }

  private normalizeHighlights(body: string, highlights: HighlightDto[] = []) {
    const normalized = highlights
      .map((highlight) => ({
        start: Math.max(0, Math.min(highlight.start, body.length)),
        end: Math.max(0, Math.min(highlight.end, body.length)),
      }))
      .filter((highlight) => highlight.start < highlight.end)
      .sort((a, b) => a.start - b.start);

    const merged: Array<{ start: number; end: number }> = [];
    for (const highlight of normalized) {
      const previous = merged.at(-1);
      if (previous && highlight.start <= previous.end) {
        previous.end = Math.max(previous.end, highlight.end);
      } else {
        merged.push({ ...highlight });
      }
    }

    return merged;
  }

  private serialize(answer: Answer, content: Content, feedback: ExplanationFeedback | null) {
    return {
      id: answer.id,
      verdict: answer.verdict,
      technique: answer.technique,
      verdictCorrect: answer.verdictCorrect,
      techniqueCorrect: answer.techniqueCorrect,
      explanationScore: answer.explanationScore,
      injectionFlag: answer.injectionFlag,
      createdAt: answer.createdAt,
      feedback,
      content: {
        id: content.id,
        title: content.title,
        body: content.body,
        senderName: content.senderName,
        isReliable: content.isReliable,
        technique: content.technique,
        expectedTechnique: content.isReliable ? Technique.none : content.technique,
        difficulty: content.difficulty,
        highlights: content.highlights,
        explanation: content.explanation,
      },
    };
  }
}
