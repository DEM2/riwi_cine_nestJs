import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // <-- Nueva importación

@Injectable()
export class JwtAuthGuard implements CanActivate {
  // Inyectamos el servicio en el Guard
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Acceso denegado. Token faltante o formato incorrecto.');
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_ACCESS_SECRET || 'tu_secreto_super_seguro';

    try {
      // Verificamos el token de forma asíncrona
      const decoded = await this.jwtService.verifyAsync(token, { secret });
      
      request.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.roleId,
      };
      return true;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
      }
      throw new UnauthorizedException('Token de autenticación inválido.');
    }
  }
}