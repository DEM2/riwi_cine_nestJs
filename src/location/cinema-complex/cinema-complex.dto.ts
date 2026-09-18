import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCinemaComplexDto {
  @ApiProperty({ example: 'Cinemark Villa Country' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Calle 72 #58-17' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  cityId: number;
}
