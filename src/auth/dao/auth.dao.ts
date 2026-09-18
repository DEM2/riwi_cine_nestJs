import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../user/user.entity.js';
import { RefreshToken } from '../entities/refresh-token.entity.js';
import { Audit } from '../entities/audit.entity.js';

@Injectable()
export class AuthDao {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(RefreshToken) private readonly refreshTokenModel: typeof RefreshToken,
    @InjectModel(Audit) private readonly auditModel: typeof Audit,
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async saveUser(user: User): Promise<void> {
    await user.save();
  }

  async logAudit(userId: number, event: string, ip: string, device: string): Promise<void> {
    // Solución línea 24: Forzamos el tipado para omitir campos automáticos (id, createdAt)
    await this.auditModel.create({ userId, event, ip, device } as any);
  }

  async replaceRefreshToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    await this.refreshTokenModel.destroy({ where: { userId } });
    // Solución línea 29: Forzamos el tipado
    await this.refreshTokenModel.create({ userId, token, expiresAt } as any);
  }
  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenModel.findOne({ where: { token } });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.refreshTokenModel.destroy({ where: { token } });
  }

  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    await this.userModel.update({ password: passwordHash }, { where: { id: userId } });
  }
}