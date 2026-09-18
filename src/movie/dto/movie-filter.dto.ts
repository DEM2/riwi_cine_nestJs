import { IsOptional, IsEnum, IsDateString, IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MovieFormat } from '../enum/movie.enum.js';
import { RoomType } from '../enum/movie.enum.js';

export class MovieFilterDto {
  @ApiPropertyOptional({ description: 'Fecha inicial de la cartelera en formato YYYY-MM-DD', example: '2026-09-18' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Identificador del género', example: '1' })
  @IsOptional()
  @IsString()
  genreId?: string;

  @ApiPropertyOptional({ description: 'Identificador de la clasificación', example: '1' })
  @IsOptional()
  @IsString()
  classificationId?: string;

  @ApiPropertyOptional({ description: 'Identificador del idioma', example: '1' })
  @IsOptional()
  @IsString()
  languageId?: string;

  @ApiPropertyOptional({ description: 'Tipo de sala', enum: RoomType, example: RoomType.STANDARD })
  @IsOptional()
  @IsEnum(RoomType)
  roomType?: RoomType;

  @ApiPropertyOptional({ description: 'Formato', enum: MovieFormat, example: MovieFormat.TWO_D })
  @IsOptional()
  @IsEnum(MovieFormat)
  format?: MovieFormat;

  @ApiPropertyOptional({ description: 'Identificador del complejo', example: '1' })
  @IsOptional()
  @IsString()
  theaterId?: string;

  @ApiPropertyOptional({ description: 'Identificador de la ciudad', example: '1' })
  @IsOptional()
  @IsString()
  cityId?: string;

  @ApiPropertyOptional({ description: 'Solo funciones con asientos disponibles', example: true })
  @IsOptional()
  @IsBoolean()
  onlyAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Solo películas de estreno', example: false })
  @IsOptional()
  @IsBoolean()
  onlyPremieres?: boolean;

  @ApiPropertyOptional({ description: 'Cantidad de días a mostrar. La cartelera semanal debe utilizar 7 por defecto.', example: 7, minimum: 1, maximum: 7 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
  days?: number = 7;

  @ApiPropertyOptional({ description: 'Página', example: 1, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Cantidad de películas por página', example: 20, minimum: 1, maximum: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  // Express-style query params for /filter endpoint
  @ApiPropertyOptional({ description: 'Filtra por título de la película', example: 'Inception' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Identificador del género', example: '1' })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({ description: 'Identificador de la clasificación', example: 'PG-13' })
  @IsOptional()
  @IsString()
  rating?: string;

  @ApiPropertyOptional({ description: 'Identificador del idioma', example: '1' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Filtra únicamente películas de estreno', example: false })
  @IsOptional()
  @IsBoolean()
  premiere?: boolean;

  @ApiPropertyOptional({ description: 'Identificador del formato', example: 1 })
  @IsOptional()
  @IsNumber()
  formatId?: number;

  @ApiPropertyOptional({ description: 'Identificador del complejo', example: '1' })
  @IsOptional()
  @IsString()
  complex?: string;

  @ApiPropertyOptional({ description: 'Filtra únicamente funciones con asientos disponibles', example: true })
  @IsOptional()
  @IsBoolean()
  available?: boolean;
}