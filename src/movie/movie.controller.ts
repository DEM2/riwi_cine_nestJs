import { Controller, Get, Query, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { MovieService } from './movie.service.js';
import { MovieFilterDto } from './dto/movie-filter.dto.js';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { BillboardResponseDto, WeeklyBillboardResponseDto, MovieCardResponseDto } from './dto/movie-response.dto.js';

/**
 * Rutas de movie - Cartelera Semanal
 * -----------------------------------
 * Endpoints HU Visualización de la Cartelera:
 *  - POST   /api/movies          : Crear película (se deja por compat Express)
 *  - GET    /api/movies          : Obtener todas las películas
 *  - GET    /api/movies/weekly   : Cartelera 7 días RN-012
 *  - GET    /api/movies/today    : Cartelera hoy
 *  - GET    /api/movies/filter   : Filtros combinados (alias legacy /filtres)
 *
 * Orden: rutas estáticas (weekly/today/filter) antes que genéricas para
 * evitar shadowing si en futuro se añade GET /:id.
 */
@ApiTags('Movies')
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva película',
    description: 'Crea una nueva película en la base de datos con sus géneros, clasificación, idioma y reparto opcional. Se mantiene por compatibilidad con Express original.',
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
    status: 409,
    description: 'Película ya registrada (conflicto)',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async createMovie(@Body() createMovieDto: CreateMovieDto): Promise<MovieCardResponseDto> {
    return this.movieService.createMovie(createMovieDto);
  }

  /**
   * GET /api/movies/weekly
   * ----------------------
   * Obtiene las películas con funciones activas en los próximos 7 días.
   *
   * Response:
   *  - 200 OK: Retorna un arreglo de películas (con sus showtimes) en formato JSON.
   *
   * @swagger
   * /api/movies/weekly:
   *   get:
   *     summary: Get movies with active showtimes in the next 7 days
   *     tags: [Movies]
   *     responses:
   *       200:
   *         description: Weekly movie list obtained successfully
   *       500:
   *         description: Internal server error
   */
  @Get('weekly')
  @ApiOperation({ summary: 'Get movies with active showtimes in the next 7 days' })
  @ApiResponse({ status: 200, description: 'Weekly movie list obtained successfully', type: BillboardResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getMoviesWeekly(): Promise<BillboardResponseDto> {
    return this.movieService.getWeeklyBillboard();
  }

  /**
   * GET /api/movies/today
   * ---------------------
   * Obtiene las películas con funciones activas para la fecha de hoy.
   *
   * Response:
   *  - 200 OK: Retorna un arreglo de películas (con sus showtimes) en formato JSON.
   *
   * @swagger
   * /api/movies/today:
   *   get:
   *     summary: Get movies with active showtimes today
   *     tags: [Movies]
   *     responses:
   *       200:
   *         description: Today's movie list obtained successfully
   *       500:
   *         description: Internal server error
   */
  @Get('today')
  @ApiOperation({ summary: 'Get movies with active showtimes today' })
  @ApiResponse({ status: 200, description: "Today's movie list obtained successfully", type: [WeeklyBillboardResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getMoviesToday(): Promise<WeeklyBillboardResponseDto[]> {
    return this.movieService.getTodayBillboard();
  }

  /**
   * GET /api/movies/filtres
   * -----------------------
   * Obtiene las películas aplicando filtros combinados por query params.
   *
   * @swagger
   * /api/movies/filtres:
   *   get:
   *     summary: Get movies applying combined filters
   *     tags: [Movies]
   *     parameters:
   *       - in: query
   *         name: title
   *         schema: { type: string }
   *       - in: query
   *         name: genre
   *         schema: { type: string }
   *       - in: query
   *         name: rating
   *         schema: { type: string }
   *       - in: query
   *         name: language
   *         schema: { type: string }
   *       - in: query
   *         name: premiere
   *         schema: { type: boolean }
   *       - in: query
   *         name: date
   *         schema: { type: string, format: date }
   *       - in: query
   *         name: formatId
   *         schema: { type: integer }
   *       - in: query
   *         name: complex
   *         schema: { type: string }
   *       - in: query
   *         name: available
   *         schema: { type: boolean }
   *     responses:
   *       200:
   *         description: Filtered movie list obtained successfully
   *       500:
   *         description: Internal server error
   */
  @Get('filter')
  @Get('filtres')
  @ApiOperation({ summary: 'Get movies applying combined filters' })
  @ApiQuery({ name: 'title', required: false, type: String, description: 'Filtra por título de la película' })
  @ApiQuery({ name: 'genre', required: false, type: String, description: 'Identificador del género' })
  @ApiQuery({ name: 'rating', required: false, type: String, description: 'Identificador de la clasificación' })
  @ApiQuery({ name: 'language', required: false, type: String, description: 'Identificador del idioma' })
  @ApiQuery({ name: 'premiere', required: false, type: Boolean, description: 'Filtra únicamente películas de estreno' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Fecha de las funciones en formato YYYY-MM-DD' })
  @ApiQuery({ name: 'formatId', required: false, type: Number, description: 'Identificador del formato' })
  @ApiQuery({ name: 'complex', required: false, type: String, description: 'Identificador del complejo' })
  @ApiQuery({ name: 'available', required: false, type: Boolean, description: 'Filtra únicamente funciones con asientos disponibles' })
  @ApiResponse({ status: 200, description: 'Filtered movie list obtained successfully', type: BillboardResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getMoviesByFilters(
    @Query() filters?: MovieFilterDto,
  ): Promise<BillboardResponseDto> {
    return this.movieService.getFilteredMovies(filters || {});
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las películas',
    description: 'Obtiene la lista completa de películas activas. Debe ir después de rutas estáticas weekly/today/filter para no hacer shadow.',
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
}