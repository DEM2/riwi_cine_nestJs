import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { MovieCardResponseDto } from './movie-response.dto.js';

export class UpcomingMovieResponseDto extends MovieCardResponseDto {
  @ApiPropertyOptional({ description: 'Sinopsis breve de la película' })
  synopsis?: string;

  @ApiPropertyOptional({ description: 'URL del tráiler oficial de YouTube' })
  trailerUrl?: string;

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
