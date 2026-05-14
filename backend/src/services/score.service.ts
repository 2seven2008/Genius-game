import { UserRepository } from '../repositories/user.repository';
import { prisma } from '../database/client';

export class ScoreService {
  private userRepo = new UserRepository();

  async saveScore(userId: string, score: number, level: number) {
    const user = await this.userRepo.updateScore(userId, score);

    // Upsert ranking entry
    await prisma.ranking.upsert({
      where: { id: `${userId}-score` },
      update: { score: Math.max(score, 0), streak: level },
      create: { id: `${userId}-score`, userId, score, streak: level, category: 'score' },
    });

    return user;
  }

  async getRankingByWins(limit: number = 20) {
    return this.userRepo.getTopByWins(limit);
  }

  async getRankingByScore(limit: number = 20) {
    return this.userRepo.getTopByScore(limit);
  }

  async getUserStats(userId: string) {
    return this.userRepo.findById(userId);
  }
}
