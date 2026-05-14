import { RoomRepository } from '../repositories/room.repository';
import { generateRoomCode } from '../utils/helpers';
import { AppError } from '../middlewares/error.middleware';

export class RoomService {
  private roomRepo = new RoomRepository();

  async createRoom(hostId: string, isPublic: boolean = true, maxPlayers: number = 2) {
    let code = generateRoomCode();
    let existing = await this.roomRepo.findByCode(code);
    while (existing) {
      code = generateRoomCode();
      existing = await this.roomRepo.findByCode(code);
    }

    const room = await this.roomRepo.create({ code, hostId, isPublic, maxPlayers });
    return room;
  }

  async getPublicRooms(limit: number = 10) {
    return this.roomRepo.getPublicRooms(limit);
  }

  async getRoomByCode(code: string) {
    const room = await this.roomRepo.findByCode(code);
    if (!room) throw new AppError('Sala não encontrada', 404);
    return room;
  }

  async deleteRoom(roomId: string) {
    return this.roomRepo.delete(roomId);
  }
}
