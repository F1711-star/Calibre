import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 20;

@Injectable()
export class AnswerThrottleGuard implements CanActivate {
  private readonly attempts = new Map<string, number[]>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: { userId?: string } }>();
    const userId = request.user?.userId;
    if (!userId) return true;

    const now = Date.now();
    const recent = (this.attempts.get(userId) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);

    if (recent.length >= MAX_ATTEMPTS) {
      throw new HttpException('Trop de réponses envoyées. Réessayez dans une minute.', HttpStatus.TOO_MANY_REQUESTS);
    }

    recent.push(now);
    this.attempts.set(userId, recent);
    return true;
  }
}
