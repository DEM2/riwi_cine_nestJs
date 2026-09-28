import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ClassificationResponseDto,
  GenreResponseDto,
  LanguageResponseDto,
} from './movie-response.dto.js';
import { SubtitleType } from '../enum/movie.enum.js';

// Respuesta propia de próximos estrenos: SIN formats ni showtimes
// (aún no tienen funciones programadas, no se envían campos vacíos).
export class UpcomingMovieResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  originalTitle?: string;

  @ApiPropertyOptional()
  posterUrl?: string;

  @ApiPropertyOptional()
  backdropUrl?: string;

  @ApiPropertyOptional({ description: 'Sinopsis breve de la película' })
  synopsis?: string;

  @ApiPropertyOptional({ description: 'URL del tráiler oficial de YouTube' })
  trailerUrl?: string;

  @ApiProperty()
  duration: number;

  @ApiPropertyOptional()
  director?: string;

  @ApiProperty({ type: [GenreResponseDto] })
  genres: GenreResponseDto[];

  @ApiProperty({ type: ClassificationResponseDto, nullable: true })
  classification: ClassificationResponseDto | null;

  @ApiProperty({ type: LanguageResponseDto, nullable: true })
  language: LanguageResponseDto | null;

  @ApiProperty({ enum: SubtitleType })
  subtitleType: SubtitleType;

  @ApiProperty()
  isPremiere: boolean;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  ratingCount: number;

  @ApiProperty()
  releaseDate: Date;

  @ApiProperty({ description: 'Días restantes hasta el estreno (0 si ya estrenó o sin fecha)' })
  daysUntilRelease: number;
}

export class CreateUpcomingNotificationDto {
  @ApiProperty({ description: 'Identificador del usuario (temporal hasta implementar auth)', example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  userId: number;

  @ApiProperty({ description: 'Identificador de la película próxima a estrenar', example: 5 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  movieId: number;
}

export class UpcomingNotificationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  movieId: number;

  @ApiProperty()
  notified: boolean;
}
