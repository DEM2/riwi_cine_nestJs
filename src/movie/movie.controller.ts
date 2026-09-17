import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { MovieService } from './movie.service.js';
import { MovieFilterDto } from './dto/movie-filter.dto.js';
import { BillboardResponseDto, WeeklyBillboardResponseDto, MovieCardResponseDto } from './dto/movie-response.dto.js';

@ApiTags('Cartelera')
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get('weekly')
  @ApiOperation({ summary: 'Obtener cartelera semanal (7 días)' })
  @ApiQuery({ name: 'cityId', required: false, type: Number, description: 'ID de la ciudad' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'genreId', required: false, type: String, description: 'ID del género' })
  @ApiQuery({ name: 'classificationId', required: false, type: String, description: 'ID de la clasificación' })
  @ApiQuery({ name: 'languageId', required: false, type: String, description: 'ID del idioma' })
  @ApiQuery({ name: 'roomType', required: false, enum: ['STANDARD', 'VIP', 'IMAX', '4DX', 'DOLBY', 'PREMIUM'], description: 'Tipo de sala' })
  @ApiQuery({ name: 'format', required: false, enum: ['2D', '3D', 'IMAX', 'VIP', '4DX', 'DOLBY_ATMOS'], description: 'Formato' })
  @ApiQuery({ name: 'theaterId', required: false, type: String, description: 'ID del complejo' })
  @ApiQuery({ name: 'onlyAvailable', required: false, type: Boolean, description: 'Solo funciones con asientos disponibles' })
  @ApiQuery({ name: 'onlyPremieres', required: false, type: Boolean, description: 'Solo estrenos' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Días a mostrar (default 7)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página (default 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite por página (default 20)' })
  @ApiResponse({ status: 200, description: 'Cartelera semanal', type: BillboardResponseDto })
  async getWeeklyBillboard(
    @Query('cityId') cityId?: number,
    @Query() filters?: MovieFilterDto,
  ): Promise<BillboardResponseDto> {
    return this.movieService.getWeeklyBillboard(cityId, filters);
  }

  @Get('today')
  @ApiOperation({ summary: 'Obtener cartelera de hoy' })
  @ApiQuery({ name: 'cityId', required: false, type: Number, description: 'ID de la ciudad' })
  @ApiQuery({ name: 'genreId', required: false, type: String, description: 'ID del género' })
  @ApiQuery({ name: 'classificationId', required: false, type: String, description: 'ID de la clasificación' })
  @ApiQuery({ name: 'languageId', required: false, type: String, description: 'ID del idioma' })
  @ApiQuery({ name: 'roomType', required: false, enum: ['STANDARD', 'VIP', 'IMAX', '4DX', 'DOLBY', 'PREMIUM'], description: 'Tipo de sala' })
  @ApiQuery({ name: 'format', required: false, enum: ['2D', '3D', 'IMAX', 'VIP', '4DX', 'DOLBY_ATMOS'], description: 'Formato' })
  @ApiQuery({ name: 'theaterId', required: false, type: String, description: 'ID del complejo' })
  @ApiQuery({ name: 'onlyAvailable', required: false, type: Boolean, description: 'Solo funciones con asientos disponibles' })
  @ApiQuery({ name: 'onlyPremieres', required: false, type: Boolean, description: 'Solo estrenos' })
  @ApiResponse({ status: 200, description: 'Cartelera de hoy', type: [WeeklyBillboardResponseDto] })
  async getTodayBillboard(
    @Query('cityId') cityId?: number,
    @Query() filters?: MovieFilterDto,
  ): Promise<WeeklyBillboardResponseDto[]> {
    return this.movieService.getTodayBillboard(cityId, filters);
  }

  @Get('filter')
  @ApiOperation({ summary: 'Filtrar cartelera con criterios personalizados' })
  @ApiQuery({ name: 'cityId', required: false, type: Number, description: 'ID de la ciudad' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Fecha específica (YYYY-MM-DD)' })
  @ApiQuery({ name: 'genreId', required: false, type: String, description: 'ID del género' })
  @ApiQuery({ name: 'classificationId', required: false, type: String, description: 'ID de la clasificación' })
  @ApiQuery({ name: 'languageId', required: false, type: String, description: 'ID del idioma' })
  @ApiQuery({ name: 'roomType', required: false, enum: ['STANDARD', 'VIP', 'IMAX', '4DX', 'DOLBY', 'PREMIUM'], description: 'Tipo de sala' })
  @ApiQuery({ name: 'format', required: false, enum: ['2D', '3D', 'IMAX', 'VIP', '4DX', 'DOLBY_ATMOS'], description: 'Formato' })
  @ApiQuery({ name: 'theaterId', required: false, type: String, description: 'ID del complejo' })
  @ApiQuery({ name: 'onlyAvailable', required: false, type: Boolean, description: 'Solo funciones con asientos disponibles' })
  @ApiQuery({ name: 'onlyPremieres', required: false, type: Boolean, description: 'Solo estrenos' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Días a mostrar (default 7)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página (default 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite por página (default 20)' })
  @ApiResponse({ status: 200, description: 'Cartelera filtrada', type: BillboardResponseDto })
  async getFilteredMovies(
    @Query('cityId') cityId?: number,
    @Query() filters?: MovieFilterDto,
  ): Promise<BillboardResponseDto> {
    return this.movieService.getFilteredMovies(filters || {}, cityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una película' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la película' })
  @ApiResponse({ status: 200, description: 'Detalle de la película', type: MovieCardResponseDto })
  @ApiResponse({ status: 404, description: 'Película no encontrada' })
  async getMovieDetail(@Param('id', ParseIntPipe) id: number): Promise<MovieCardResponseDto | null> {
    return this.movieService.getMovieDetail(id);
  }
}