import { IsOptional, IsEnum, IsDateString, IsString, IsNumber, IsBoolean, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { MovieFormat } from '../enum/movie.enum.js';
import { RoomType } from '../enum/movie.enum.js';
import { ClassificationType } from '../enum/movie.enum.js';
import { LanguageType } from '../enum/movie.enum.js';
import { SubtitleType } from '../enum/movie.enum.js';

export class MovieFilterDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  genreId?: string;

  @IsOptional()
  @IsString()
  classificationId?: string;

  @IsOptional()
  @IsString()
  languageId?: string;

  @IsOptional()
  @IsEnum(RoomType)
  roomType?: RoomType;

  @IsOptional()
  @IsEnum(MovieFormat)
  format?: MovieFormat;

  @IsOptional()
  @IsString()
  theaterId?: string;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsBoolean()
  onlyAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  onlyPremieres?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
  days?: number = 7;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}