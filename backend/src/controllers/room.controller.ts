import { Response, NextFunction } from "express";
import { RoomService } from "../services/room.service";
import { AuthRequest } from "../types/auth.types";
import { AppError } from "../middlewares/error.middleware";

const roomService = new RoomService();

export class RoomController {
  async createRoom(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) throw new AppError("Não autenticado", 401);
      const { isPublic = true, maxPlayers = 2 } = req.body;
      const room = await roomService.createRoom(
        req.user.userId,
        isPublic,
        maxPlayers,
      );
      res.status(201).json(room);
    } catch (error) {
      next(error);
    }
  }

  async getPublicRooms(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 10;
      const rooms = await roomService.getPublicRooms(limit);
      res.json(rooms);
    } catch (error) {
      next(error);
    }
  }

  async getRoomByCode(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const room = await roomService.getRoomByCode(req.params.code);
      res.json(room);
    } catch (error) {
      next(error);
    }
  }
}
