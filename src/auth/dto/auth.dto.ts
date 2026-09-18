import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class LoginDto {
  @ApiProperty({
    example: 'usuario@cine.com',
    description: 'Correo electrónico del usuario registrado',
    format: 'email',
  })
  @IsEmail({}, { message: 'El formato del correo no es válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email!: string;

  @ApiProperty({
    example: 'PasswordSegura123',
    description: 'Contraseña del usuario',
    format: 'password',
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    example: '8f31a7c92b5e4d...',
    description: 'Token de verificación enviado al correo',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh Token proporcionado tras el login exitoso',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'usuario@cine.com',
    description: 'Correo electrónico para solicitar el restablecimiento de contraseña',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'token_de_recuperacion_123',
    description: 'Token enviado por correo electrónico',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    example: 'NuevaClave123!',
    description: 'Nueva contraseña segura',
  })
  @IsString()
  @IsNotEmpty()
  newPassword!: string;
}