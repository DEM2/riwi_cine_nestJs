import { IsDateString, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateShowtimeDto {
  @ApiProperty({ example: 1, description: 'ID de la película (status ACTIVE)' })
  @Type(() => Number)
  @IsInt()
  movieId: number;

  @ApiProperty({ example: 1, description: 'ID de la sala' })
  @Type(() => Number)
  @IsInt()
  roomId: number;

  @ApiProperty({ example: 1, description: 'ID del formato (1=2D, 2=3D)' })
  @Type(() => Number)
  @IsInt()
  formatId: number;

  @ApiProperty({ example: '2026-09-28T19:00:00', description: 'Inicio de la función (ISO)' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-09-28T21:30:00', description: 'Fin de la función (ISO)' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ example: 12000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ example: 12000, description: 'Si se omite, = basePrice + surcharge del formato' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  finalPrice?: number;

  @ApiPropertyOptional({ example: 50, description: 'Si se omite, = capacidad de la sala' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  totalSeats?: number;
}
