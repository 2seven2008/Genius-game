import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { generateGuestUsername } from '../utils/helpers';
import { AppError } from '../middlewares/error.middleware';
import { User } from '@prisma/client';

export class AuthService {
  private userRepo = new UserRepository();

  async register(username: string, email: string, password: string) {
    const existingEmail = await this.userRepo.findByEmail(email);
    if (existingEmail) throw new AppError('Email já está em uso', 409);

    const existingUsername = await this.userRepo.findByUsername(username);
    if (existingUsername) throw new AppError('Nome de usuário já está em uso', 409);

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.userRepo.create({
      username,
      email,
      password: hashedPassword,
      isGuest: false,
    });

    const tokens = generateTokens({
      userId: user.id,
      username: user.username,
      isGuest: false,
    });

    return { user: this.sanitizeUser(user), tokens };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.password) throw new AppError('Credenciais inválidas', 401);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new AppError('Credenciais inválidas', 401);

    const tokens = generateTokens({
      userId: user.id,
      username: user.username,
      isGuest: false,
    });

    return { user: this.sanitizeUser(user), tokens };
  }

  async loginAsGuest() {
    let username = generateGuestUsername();
    // Ensure username uniqueness
    let existing = await this.userRepo.findByUsername(username);
    while (existing) {
      username = generateGuestUsername();
      existing = await this.userRepo.findByUsername(username);
    }

    const user = await this.userRepo.create({ username, isGuest: true });

    const tokens = generateTokens({
      userId: user.id,
      username: user.username,
      isGuest: true,
    });

    return { user: this.sanitizeUser(user), tokens };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await this.userRepo.findById(payload.userId);
      if (!user) throw new AppError('Usuário não encontrado', 404);

      const tokens = generateTokens({
        userId: user.id,
        username: user.username,
        isGuest: user.isGuest,
      });

      return { tokens };
    } catch {
      throw new AppError('Refresh token inválido', 401);
    }
  }

  private sanitizeUser(user: User) {
    const { password, ...rest } = user;
    return rest;
  }
}
