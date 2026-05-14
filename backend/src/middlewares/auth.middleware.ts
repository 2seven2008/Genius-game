import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types";
import { verifyAccessToken } from "../utils/jwt";
import { logger } from "../utils/logger";

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token de autenticação não fornecido" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      username: payload.username,
      isGuest: payload.isGuest,
    };
    next();
  } catch (error) {
    logger.warn("Invalid token attempt");
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      username: payload.username,
      isGuest: payload.isGuest,
    };
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}
