import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, IsUrl, Min, Max, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { MovieStatus } from '../enum/movie.enum.js';

export class CreateMovieCastDto {
  @ApiProperty({ example: 'Leonardo DiCaprio' })
  @IsString()
  actorName: string;

  @ApiPropertyOptional({ example: 'Dom Cobb' })
  @IsOptional()
  @IsString()
  roleName?: string;
}

export class CreateMovieDto {
  @ApiProperty({ example: 'Inception' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Inception' })
  @IsString()
  original_title: string;

  @ApiProperty({ example: 'Dom Cobb es un ladrón especializado en infiltrarse en los sueños.' })
  @IsString()
  synopsis: string;

  @ApiProperty({ example: 'Christopher Nolan' })
  @IsString()
  director: string;

  @ApiProperty({ example: 148 })
  @IsNumber()
  @Min(1)
  duration_minutes: number;

  @ApiProperty({ type: [Number], example: [1, 6] })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  genres: number[];

  @ApiProperty({ example: 'PG-13' })
  @IsString()
  rating: string;

  @ApiProperty({ example: 'Inglés' })
  @IsString()
  language: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  dubbed: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  subtitled: boolean;

  @ApiProperty({ example: 'https://image.tmdb.org/t/p/original/poster.jpg' })
  @IsUrl()
  poster: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  premiere?: boolean;

  @ApiProperty({ example: 4.8 })
  @IsNumber()
  @Min(0)
  @Max(5)
  audience_rating: number;

  @ApiProperty({ example: 'https://www.youtube.com/embed/YoHD9XEInc0' })
  @IsUrl()
  trailer_url: string;

  @ApiProperty({ example: '2026-08-19' })
  @IsDateString()
  release_date: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_release?: boolean;

  @ApiPropertyOptional({ enum: MovieStatus, example: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: MovieStatus;

  @ApiPropertyOptional({ type: [CreateMovieCastDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMovieCastDto)
  cast?: CreateMovieCastDto[];

  @ApiPropertyOptional({ example: 'https://image.tmdb.org/t/p/original/banner.jpg' })
  @IsOptional()
  @IsUrl()
  banner_url?: string;
}