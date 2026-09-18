import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { MovieService } from './movie.service.js';
import { MovieFilterDto } from './dto/movie-filter.dto.js';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { BillboardResponseDto, WeeklyBillboardResponseDto, MovieCardResponseDto } from './dto/movie-response.dto.js';

@ApiTags('Movies')
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear una nueva película',
    description: 'Crea una nueva película en la base de datos con sus géneros, clasificación, idioma y reparto opcional.',
  })
  @ApiBody({ type: CreateMovieDto })
  @ApiResponse({
    status: 201,
    description: 'Película creada exitosamente',
    type: MovieCardResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos, sin géneros, o película ya registrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async createMovie(@Body() createMovieDto: CreateMovieDto): Promise<MovieCardResponseDto> {
    return this.movieService.createMovie(createMovieDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las películas',
    description: 'Obtiene la lista completa de películas registradas en la base de datos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de películas obtenida exitosamente',
    type: [MovieCardResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async getMovies(): Promise<MovieCardResponseDto[]> {
    return this.movieService.getAllMovies();
  }

  @Get('weekly')
  @ApiOperation({
    summary: 'Obtener cartelera semanal (7 días)',
    description: 'Obtiene las películas con funciones activas en los próximos 7 días.',
  })
  @ApiQuery({ name: 'cityId', required: false, type: Number, description: 'Identificador de la ciudad' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Fecha inicial de la cartelera en formato YYYY-MM-DD' })
  @ApiQuery({ name: 'genreId', required: false, type: String, description: 'Identificador del género' })
  @ApiQuery({ name: 'classificationId', required: false, type: String, description: 'Identificador de la clasificación' })
  @ApiQuery({ name: 'languageId', required: false, type: String, description: 'Identificador del idioma' })
  @ApiQuery({ name: 'roomType', required: false, enum: ['STANDARD', 'VIP', 'IMAX', '4DX', 'DOLBY', 'PREMIUM'], description: 'Tipo de sala' })
  @ApiQuery({ name: 'format', required: false, enum: ['2D', '3D', 'IMAX', 'VIP', '4DX', 'DOLBY_ATMOS'], description: 'Formato' })
  @ApiQuery({ name: 'theaterId', required: false, type: String, description: 'Identificador del complejo' })
  @ApiQuery({ name: 'onlyAvailable', required: false, type: Boolean, description: 'Solo funciones con asientos disponibles' })
  @ApiQuery({ name: 'onlyPremieres', required: false, type: Boolean, description: 'Solo películas de estreno' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Cantidad de días a mostrar. La cartelera semanal debe utilizar 7 por defecto.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Cantidad de películas por página' })
  @ApiResponse({
    status: 200,
    description: 'Cartelera semanal',
    type: BillboardResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async getMoviesWeekly(
    @Query('cityId') cityId?: number,
    @Query() filters?: MovieFilterDto,
  ): Promise<BillboardResponseDto> {
    return this.movieService.getWeeklyBillboard(cityId, filters);
  }

  @Get('today')
  @ApiOperation({
    summary: 'Obtener cartelera de hoy',
    description: 'Obtiene las películas con funciones activas para la fecha de hoy.',
  })
  @ApiQuery({ name: 'cityId', required: false, type: Number, description: 'Identificador de la ciudad' })
  @ApiQuery({ name: 'genreId', required: false, type: String, description: 'Identificador del género' })
  @ApiQuery({ name: 'classificationId', required: false, type: String, description: 'Identificador de la clasificación' })
  @ApiQuery({ name: 'languageId', required: false, type: String, description: 'Identificador del idioma' })
  @ApiQuery({ name: 'roomType', required: false, enum: ['STANDARD', 'VIP', 'IMAX', '4DX', 'DOLBY', 'PREMIUM'], description: 'Tipo de sala' })
  @ApiQuery({ name: 'format', required: false, enum: ['2D', '3D', 'IMAX', 'VIP', '4DX', 'DOLBY_ATMOS'], description: 'Formato' })
  @ApiQuery({ name: 'theaterId', required: false, type: String, description: 'Identificador del complejo' })
  @ApiQuery({ name: 'onlyAvailable', required: false, type: Boolean, description: 'Solo funciones con asientos disponibles' })
  @ApiQuery({ name: 'onlyPremieres', required: false, type: Boolean, description: 'Solo estrenos' })
  @ApiResponse({
    status: 200,
    description: 'Cartelera de hoy',
    type: [WeeklyBillboardResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async getMoviesToday(
    @Query('cityId') cityId?: number,
    @Query() filters?: MovieFilterDto,
  ): Promise<WeeklyBillboardResponseDto[]> {
    return this.movieService.getTodayBillboard(cityId, filters);
  }

  @Get('filter')
  @ApiOperation({
    summary: 'Filtrar cartelera con criterios combinados',
    description: 'Obtiene las películas aplicando filtros combinados por query params.',
  })
  @ApiQuery({ name: 'title', required: false, type: String, description: 'Filtra por título de la película' })
  @ApiQuery({ name: 'genre', required: false, type: String, description: 'Identificador del género' })
  @ApiQuery({ name: 'rating', required: false, type: String, description: 'Identificador de la clasificación' })
  @ApiQuery({ name: 'language', required: false, type: String, description: 'Identificador del idioma' })
  @ApiQuery({ name: 'premiere', required: false, type: Boolean, description: 'Filtra únicamente películas de estreno' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Fecha de las funciones en formato YYYY-MM-DD' })
  @ApiQuery({ name: 'formatId', required: false, type: Number, description: 'Identificador del formato' })
  @ApiQuery({ name: 'complex', required: false, type: String, description: 'Identificador del complejo' })
  @ApiQuery({ name: 'available', required: false, type: Boolean, description: 'Filtra únicamente funciones con asientos disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Cartelera filtrada',
    type: BillboardResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async getMoviesByFilters(
    @Query() filters?: MovieFilterDto,
  ): Promise<BillboardResponseDto> {
    return this.movieService.getFilteredMovies(filters || {});
  }
}