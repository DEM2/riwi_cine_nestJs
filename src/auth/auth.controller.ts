import { Controller, Post, Body, Ip, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { ForgotPasswordDto, LoginDto, RefreshTokenDto, ResetPasswordDto, VerifyEmailDto } from './dto/auth.dto.js';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión de forma segura' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso. Retorna tokens y perfil.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  @ApiResponse({ status: 403, description: 'Correo no verificado o cuenta bloqueada (RN-027, RN-031).' })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') device: string,
  ) {
    const data = await this.authService.login(loginDto.email, loginDto.password, ip || 'Unknown IP', device || 'Unknown Device');
    return { success: true, data };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar el correo electrónico del usuario' })
  @ApiResponse({ status: 200, description: 'Correo electrónico verificado correctamente' })
  async verifyEmail(@Body() verifyDto: VerifyEmailDto) {
    // Aquí inyectarías y llamarías a tu EmailVerificationService
    // return await this.emailVerificationService.verify(verifyDto.token);
    return { success: true, message: "Token recibido" };
  }
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar sesión y tokens de acceso' })
  @ApiResponse({ status: 200, description: 'Nuevos tokens generados' })
  async refresh(
    @Body() body: RefreshTokenDto, 
    @Ip() ip: string, 
    @Headers('user-agent') device: string
  ) {
    const data = await this.authService.refreshToken(body.refreshToken, ip || 'Unknown IP', device || 'Unknown Device');
    return { success: true, data };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión e invalidar tokens' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  async logout(
    @Body() body: RefreshTokenDto, 
    @Ip() ip: string, 
    @Headers('user-agent') device: string
  ) {
    await this.authService.logout(body.refreshToken, ip || 'Unknown IP', device || 'Unknown Device');
    return { success: true, message: 'Sesión cerrada' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return await this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Establecer nueva contraseña' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.authService.resetPassword(body.token, body.newPassword);
    return { success: true, message: 'Contraseña actualizada correctamente' };
  }
}