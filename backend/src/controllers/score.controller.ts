import { Response, NextFunction } from "express";
import { ScoreService } from "../services/score.service";
import { AuthRequest } from "../types/auth.types";
import { AppError } from "../middlewares/error.middleware";

const scoreService = new ScoreService();

export class ScoreController {
  async saveScore(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) throw new AppError("Não autenticado", 401);
      const { score, level } = req.body;
      const user = await scoreService.saveScore(req.user.userId, score, level);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async getRankingByWins(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 20;
      const ranking = await scoreService.getRankingByWins(limit);
      res.json(ranking);
    } catch (error) {
      next(error);
    }
  }

  async getRankingByScore(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 20;
      const ranking = await scoreService.getRankingByScore(limit);
      res.json(ranking);
    } catch (error) {
      next(error);
    }
  }

  async getMe(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) throw new AppError("Não autenticado", 401);
      const user = await scoreService.getUserStats(req.user.userId);
      if (!user) throw new AppError("Usuário não encontrado", 404);
      const { password, ...rest } = user as any;
      res.json(rest);
    } catch (error) {
      next(error);
    }
  }
}
