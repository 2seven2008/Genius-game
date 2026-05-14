import { prisma } from '../database/client';
import { User } from '@prisma/client';

export interface CreateUserData {
  username: string;
  email?: string;
  password?: string;
  isGuest?: boolean;
}

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
  }

  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({ data });
  }

  async updateScore(userId: string, score: number): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return prisma.user.update({
      where: { id: userId },
      data: {
        highScore: Math.max(user?.highScore ?? 0, score),
        matches: { increment: 1 },
      },
    });
  }

  async incrementWins(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { wins: { increment: 1 } },
    });
  }

  async getTopByWins(limit: number = 20): Promise<User[]> {
    return prisma.user.findMany({
      where: { isGuest: false },
      orderBy: { wins: 'desc' },
      take: limit,
    });
  }

  async getTopByScore(limit: number = 20): Promise<User[]> {
    return prisma.user.findMany({
      where: { isGuest: false },
      orderBy: { highScore: 'desc' },
      take: limit,
    });
  }
}
