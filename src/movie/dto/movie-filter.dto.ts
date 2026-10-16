import { IsOptional, IsEnum, IsDateString, IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { MovieFormat } from '../enum/movie.enum.js';
import { RoomType } from '../enum/movie.enum.js';

function toBoolean(value: any): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.toLowerCase().trim();
    if (v === 'true' || v === '1') return true;
    if (v === 'false' || v === '0') return false;
  }
  return undefined;
}

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

  @ApiPropertyOptional({ description: 'Solo funciones con asientos disponibles (RN-011)', example: true })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  onlyAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Solo películas de estreno', example: false })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  onlyPremieres?: boolean;

  @ApiPropertyOptional({ description: 'Cantidad de días a mostrar. La cartelera semanal debe utilizar 7 por defecto. RN-012', example: 7, minimum: 1, maximum: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(7)
  days?: number = 7;

  @ApiPropertyOptional({ description: 'Página', example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Cantidad de películas por página', example: 20, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
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
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  premiere?: boolean;

  @ApiPropertyOptional({ description: 'Identificador del formato (legacy Express: formatId)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  formatId?: number;

  @ApiPropertyOptional({ description: 'Identificador del complejo (legacy Express: complex)', example: '1' })
  @IsOptional()
  @IsString()
  complex?: string;

  @ApiPropertyOptional({ description: 'Filtra únicamente funciones con asientos disponibles (legacy Express: available)', example: true })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  available?: boolean;
}