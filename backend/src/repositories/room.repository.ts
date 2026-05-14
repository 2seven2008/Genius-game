import { prisma } from '../database/client';
import { Room, RoomStatus } from '@prisma/client';

export class RoomRepository {
  async findByCode(code: string): Promise<Room | null> {
    return prisma.room.findUnique({ where: { code } });
  }

  async findById(id: string): Promise<Room | null> {
    return prisma.room.findUnique({ where: { id } });
  }

  async create(data: {
    code: string;
    hostId: string;
    isPublic?: boolean;
    maxPlayers?: number;
  }): Promise<Room> {
    return prisma.room.create({ data });
  }

  async updateStatus(id: string, status: RoomStatus): Promise<Room> {
    return prisma.room.update({ where: { id }, data: { status } });
  }

  async getPublicRooms(limit: number = 10): Promise<Room[]> {
    return prisma.room.findMany({
      where: { isPublic: true, status: 'WAITING' },
      include: { host: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async delete(id: string): Promise<Room> {
    return prisma.room.delete({ where: { id } });
  }
}
