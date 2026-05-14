import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      status: 'error',
    });
    return;
  }

  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    status: 'error',
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Rota ${req.method} ${req.url} não encontrada` });
}
