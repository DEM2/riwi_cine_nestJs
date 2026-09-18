import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovieFormat } from '../enum/movie.enum.js';
import { RoomType } from '../enum/movie.enum.js';
import { SubtitleType } from '../enum/movie.enum.js';

export class FormatResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: MovieFormat })
  code: MovieFormat;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  surcharge: number;
}

export class RoomResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  number: number;

  @ApiProperty({ enum: RoomType })
  type: RoomType;

  @ApiProperty()
  capacity: number;
}

export class TheaterResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiProperty()
  rooms: RoomResponseDto[];
}

export class ShowtimeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  basePrice: number;

  @ApiProperty()
  finalPrice: number;

  @ApiProperty()
  availableSeats: number;

  @ApiProperty()
  totalSeats: number;

  @ApiProperty()
  isAvailable: boolean;

  @ApiPropertyOptional({ type: FormatResponseDto })
  format: FormatResponseDto | null;

  @ApiPropertyOptional({ type: RoomResponseDto })
  room: RoomResponseDto | null;

  @ApiPropertyOptional({ type: TheaterResponseDto })
  theater: TheaterResponseDto | null;
}

export class GenreResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;
}

export class ClassificationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  minimumAge: number;
}

export class LanguageResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;
}

export class MovieCardResponseDto {
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

  @ApiProperty()
  duration: number;

  @ApiPropertyOptional()
  director?: string;

  @ApiProperty({ type: [GenreResponseDto]})
  genres: GenreResponseDto [];

  @ApiProperty({ type: ClassificationResponseDto, nullable: true })
  classification: ClassificationResponseDto | null;

  @ApiProperty({ type: LanguageResponseDto, nullable: true })
  language: LanguageResponseDto | null;

  @ApiProperty({ enum: SubtitleType })
  subtitleType: SubtitleType;

  @ApiProperty({ type: [FormatResponseDto] })
  formats: FormatResponseDto[];

  @ApiProperty({ type: [ShowtimeResponseDto] })
  showtimes: ShowtimeResponseDto[];

  @ApiProperty()
  isPremiere: boolean;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  ratingCount: number;

  @ApiProperty()
  releaseDate: Date;
}

export class WeeklyBillboardResponseDto {
  @ApiProperty()
  date: string;

  @ApiProperty({ type: [MovieCardResponseDto] })
  movies: MovieCardResponseDto[];
}

export class BillboardResponseDto {
  @ApiProperty({ type: [WeeklyBillboardResponseDto] })
  week: WeeklyBillboardResponseDto[];

  @ApiProperty()
  totalMovies: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  totalPages: number;
}