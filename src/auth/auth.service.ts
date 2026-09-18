import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthDao } from './dao/auth.dao.js';

@Injectable()
export class AuthService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutos

  constructor(
    private readonly authDao: AuthDao,
    private readonly jwtService: JwtService
  ) {}

  async login(email: string, pass: string, ip: string, device: string) {
    const user = await this.authDao.findUserByEmail(email);

    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    if (!user.isVerified) throw new ForbiddenException('Debes verificar tu correo electrónico');
    if (user.status !== 'ACTIVO') throw new ForbiddenException('La cuenta no se encuentra activa');

    // Verificar si la cuenta está bloqueada
    if (user.lockoutUntil && user.lockoutUntil.getTime() > Date.now()) {
      throw new ForbiddenException('Cuenta bloqueada. Intenta de nuevo en 15 minutos.');
    }

    // Reiniciar intentos si el tiempo de bloqueo ya pasó
    if (user.lockoutUntil && user.lockoutUntil.getTime() <= Date.now()) {
      user.failedLoginAttempts = 0;
      user.lockoutUntil = undefined;
      await this.authDao.saveUser(user);
    }

    const isValid = await bcrypt.compare(pass, user.password);

    if (!isValid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= this.MAX_FAILED_ATTEMPTS) {
        user.lockoutUntil = new Date(Date.now() + this.LOCK_TIME_MS);
      }
      await this.authDao.saveUser(user);
      await this.authDao.logAudit(user.id, 'LOGIN_FAILED', ip, device);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Login exitoso: reiniciar intentos
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    await this.authDao.saveUser(user);

    const payload = { userId: user.id, roleId: user.roleId };
    
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'secret_dev',
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_dev',
      expiresIn: '7d',
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.authDao.replaceRefreshToken(user.id, refreshToken, expiresAt);
    await this.authDao.logAudit(user.id, 'LOGIN_SUCCESS', ip, device);

    return {
      accessToken,
      refreshToken,
      membershipInfo: null, // Pendiente HU-008
      activeBenefits: [],   // Pendiente HU-008
      profile: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
    };
  }
  async refreshToken(token: string, ip: string, device: string) {
    const storedToken = await this.authDao.findRefreshToken(token);
    
    // RN-030: El token debe existir y no haber expirado
    if (!storedToken || storedToken.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    try {
      // Verificamos la firma del token
      const decoded = await this.jwtService.verifyAsync(token, { 
        secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_dev' 
      });
      
      const payload = { userId: decoded.userId, roleId: decoded.roleId };
      
      // Generamos nuevos tokens
      const newAccessToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'secret_dev',
        expiresIn: '15m',
      });

      const newRefreshToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_dev',
        expiresIn: '7d',
      });

      // Reemplazamos el token viejo en la base de datos
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await this.authDao.replaceRefreshToken(decoded.userId, newRefreshToken, expiresAt);
      await this.authDao.logAudit(decoded.userId, 'REFRESH_SUCCESS', ip, device);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async logout(token: string, ip: string, device: string) {
    await this.authDao.deleteRefreshToken(token);
    await this.authDao.logAudit(null as any, 'LOGOUT', ip, device);
    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await this.authDao.findUserByEmail(email);
    
    // Por seguridad, siempre retornamos éxito para no revelar qué correos existen en BD
    if (!user) return { success: true, message: 'Instrucciones enviadas' }; 
    
    const resetToken = await this.jwtService.signAsync(
      { userId: user.id }, 
      { secret: process.env.JWT_ACCESS_SECRET || 'secret_dev', expiresIn: '1h' }
    );
    
    // TODO: Llamar al servicio de correos para enviar el resetToken
    // await this.emailService.sendPasswordReset(user.email, resetToken);
    
    return { success: true, message: 'Instrucciones enviadas' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(token, { 
        secret: process.env.JWT_ACCESS_SECRET || 'secret_dev' 
      });
      
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);
      
      await this.authDao.updatePassword(decoded.userId, hash);
      return { success: true };
    } catch (error) {
      throw new UnauthorizedException('Token de recuperación inválido o expirado');
    }
  }
}