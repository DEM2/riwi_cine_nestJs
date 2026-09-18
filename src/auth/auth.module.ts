import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthDao } from './dao/auth.dao.js';
import { User } from '../user/user.entity.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { Audit } from './entities/audit.entity.js';

@Module({
  imports: [
    // Registramos los modelos en este módulo
    SequelizeModule.forFeature([User, RefreshToken, Audit]),
    JwtModule.register({}), 
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthDao],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}