import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { MovieDao } from './dao/movie.dao.js';
import { CreateGenreDto, GenreResponseDto } from './dto/create-genre.dto.js';
import { CreateShowtimeDto } from './dto/create-showtime.dto.js';
import { BadRequestException } from '@nestjs/common';
import { MovieFilterDto } from './dto/movie-filter.dto.js';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpcomingMovieResponseDto, UpcomingNotificationResponseDto } from './dto/upcoming-movie.dto.js';
import { BillboardResponseDto, WeeklyBillboardResponseDto, MovieCardResponseDto, ShowtimeResponseDto, FormatResponseDto } from './dto/movie-response.dto.js';
import { Movie } from './entity/movie.entity.js';
import { ShowtimeStatus } from './enum/movie.enum.js';
import { SubtitleType } from './enum/movie.enum.js';

@Injectable()
export class MovieService {
  private readonly logger = new Logger(MovieService.name);

  constructor(private readonly movieDao: MovieDao) {}

  async getAllMovies(): Promise<MovieCardResponseDto[]> {
    const movies = await this.movieDao.findActiveMovies();
    const today = this.startOfDay(new Date());
    return movies.map(movie => this.mapToMovieCard(movie, today));
  }

  async getWeeklyBillboard(): Promise<BillboardResponseDto> {
    // RN-012: cartelera siempre 7 días sin filtros - solo funciones activas
    const days = 7;
    const today = this.startOfDay(new Date());
    const endDate = this.endOfDay(this.addDays(today, days - 1));

    const movies = await this.movieDao.findMoviesWithFilters({
      startDate: today,
      endDate,
    });

    // RN-010: solo películas con al menos 1 showtime activo
    const moviesWithShowtimes = movies.filter(m => m.showtimes && m.showtimes.length > 0);
    const weeklyData = this.groupMoviesByDate(moviesWithShowtimes, today, days);

    const totalMovies = new Set(moviesWithShowtimes.map(m => m.id)).size;

    return {
      week: weeklyData,
      totalMovies,
      currentPage: 1,
      totalPages: 1,
    };
  }

  async getTodayBillboard(): Promise<WeeklyBillboardResponseDto[]> {
    const today = this.startOfDay(new Date());
    const endDate = this.endOfDay(today);

    const movies = await this.movieDao.findMoviesWithFilters({
      startDate: today,
      endDate,
    });

    const moviesWithShowtimes = movies.filter(m => m.showtimes && m.showtimes.length > 0);
    return this.groupMoviesByDate(moviesWithShowtimes, today, 1);
  }

  async getFilteredMovies(filters: MovieFilterDto): Promise<BillboardResponseDto> {
    const today = this.startOfDay(new Date());
    let startDate = today;
    // RN-012: por defecto 7 días si no hay fecha específica
    let days = filters.days ?? 7;
    let endDate = this.endOfDay(this.addDays(today, days - 1));

    if (filters.date) {
      startDate = this.startOfDay(new Date(filters.date));
      endDate = this.endOfDay(new Date(filters.date));
      days = 1;
      // Si se filtra por fecha concreta, mostrar solo ese día (excepto que el cliente pida days)
      if (filters.days) days = filters.days;
    }

    const genreId = filters.genreId ? parseInt(filters.genreId) : (filters.genre ? parseInt(filters.genre) : undefined);
    const classificationId = filters.classificationId ? parseInt(filters.classificationId) : (filters.rating ? parseInt(filters.rating) : undefined);
    const languageId = filters.languageId ? parseInt(filters.languageId) : (filters.language ? parseInt(filters.language) : undefined);
    const theaterId = filters.theaterId ? parseInt(filters.theaterId) : (filters.complex ? parseInt(filters.complex) : undefined);
    const formatCode = filters.format || (filters.formatId ? filters.formatId.toString() : undefined);
    const onlyAvailable = filters.onlyAvailable ?? filters.available;
    const onlyPremieres = filters.onlyPremieres ?? filters.premiere;

    const movies = await this.movieDao.findMoviesWithFilters({
      startDate,
      endDate,
      genreId,
      classificationId,
      languageId,
      roomType: filters.roomType,
      formatCode,
      theaterId,
      cityId: filters.cityId ? parseInt(filters.cityId) : undefined,
      onlyAvailable,
      onlyPremieres,
      title: filters.title,
      page: filters.page,
      limit: filters.limit,
    });

    const moviesWithShowtimes = movies.filter(m => m.showtimes && m.showtimes.length > 0);
    const weeklyData = this.groupMoviesByDate(moviesWithShowtimes, startDate, days);

    const totalMovies = new Set(moviesWithShowtimes.map(m => m.id)).size;
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const totalPages = Math.ceil(totalMovies / limit) || 1;

    return {
      week: weeklyData,
      totalMovies,
      currentPage: page,
      totalPages,
    };
  }

  private groupMoviesByDate(movies: Movie[], startDate: Date, days: number): WeeklyBillboardResponseDto[] {
    const weeklyData: WeeklyBillboardResponseDto[] = [];

    for (let i = 0; i < days; i++) {
      const currentDate = this.addDays(startDate, i);
      const dateStr = this.formatDate(currentDate);

      const moviesForDate = movies.filter(movie =>
        movie.showtimes.some(showtime =>
          this.isSameDay(showtime.startTime, currentDate)
        )
      );

      const movieCards = moviesForDate.map(movie => this.mapToMovieCard(movie, currentDate));

      weeklyData.push({
        date: dateStr,
        movies: movieCards,
      });
    }

    return weeklyData;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return this.formatDate(date1) === this.formatDate(date2);
  }

  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private endOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private mapToMovieCard(movie: Movie, date: Date): MovieCardResponseDto {
    const showtimesForDate = (movie.showtimes ?? [])
      .filter(st => this.isSameDay(st.startTime, date) && st.status === ShowtimeStatus.ACTIVE)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    const uniqueFormats = new Map<number, FormatResponseDto>();
    showtimesForDate.forEach(st => {
      if (st.format && !uniqueFormats.has(st.format.id)) {
        uniqueFormats.set(st.format.id, {
          id: st.format.id,
          code: st.format.code,
          name: st.format.name,
          description: st.format.description,
          surcharge: st.format.surcharge,
        });
      }
    });

    const showtimeDtos: ShowtimeResponseDto[] = showtimesForDate.map(st => ({
      id: st.id,
      startTime: st.startTime,
      endTime: st.endTime,
      basePrice: Number(st.basePrice),
      finalPrice: Number(st.finalPrice),
      availableSeats: st.availableSeats,
      totalSeats: st.totalSeats,
      isAvailable: st.availableSeats > 0 && st.status === ShowtimeStatus.ACTIVE,
      format: st.format ? {
        id: st.format.id,
        code: st.format.code,
        name: st.format.name,
        description: st.format.description,
        surcharge: st.format.surcharge,
      } : null,
      room: st.room ? {
        id: st.room.id,
        name: st.room.name,
        number: st.room.number,
        type: st.room.type,
        capacity: st.room.capacity,
      } : null,
      theater: st.room?.theater ? {
        id: st.room.theater.id,
        name: st.room.theater.name,
        address: st.room.theater.address,
        rooms: [],
      } : null,
    }));

    // Determinar subtitulada/doblada según idioma: si no hay language, default SUBTITLED.
    const subtitleType = this.resolveSubtitleType(movie);

    return {
      id: movie.id,
      title: movie.title,
      originalTitle: movie.originalTitle,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl,
      duration: movie.duration,
      director: movie.director,
      genres: movie.genres ? movie.genres.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description,
      })) : [],
      classification: movie.classification ? {
        id: movie.classification.id,
        name: movie.classification.name,
        code: movie.classification.code,
        description: movie.classification.description,
        minimumAge: movie.classification.minimumAge,
      } : null,
      language: movie.language ? {
        id: movie.language.id,
        name: movie.language.name,
        code: movie.language.code,
      } : null,
      subtitleType,
      formats: Array.from(uniqueFormats.values()),
      showtimes: showtimeDtos,
      isPremiere: movie.isPremiere,
      rating: Number(movie.rating),
      ratingCount: movie.ratingCount,
      releaseDate: movie.releaseDate,
    };
  }

  async createMovie(createMovieDto: CreateMovieDto): Promise<MovieCardResponseDto> {
    const releaseDate = createMovieDto.release_date ? new Date(createMovieDto.release_date) : new Date();

    const existingMovie = await this.movieDao.findMovieByTitleAndReleaseDate(
      createMovieDto.title,
      releaseDate,
    );

    if (existingMovie) {
      // 409 Conflict coherente con swagger Express original
      throw new ConflictException('La película ya se encuentra registrada.');
    }

    try {
      const movie = this.movieDao.createMovie(createMovieDto);
      const savedMovie = await this.movieDao.saveMovie(movie);
      const detail = await this.getMovieDetail(savedMovie.id);
      if (!detail) {
        // Fallback si findMovieById no lo encuentra inmediatamente
        this.logger.warn(`Movie created id=${savedMovie.id} but detail not found`);
        return this.mapToMovieCard(savedMovie, this.startOfDay(new Date()));
      }
      return detail;
    } catch (error) {
      this.logger.error('Error creating movie', error instanceof Error ? error.stack : String(error));
      if (error instanceof ConflictException) throw error;
      throw error;
    }
  }

  async getMovieDetail(id: number): Promise<MovieCardResponseDto | null> {
    const movie = await this.movieDao.findMovieById(id);
    if (!movie) return null;

    const today = this.startOfDay(new Date());
    return this.mapToMovieCard(movie, today);
  }

  async getAllGenres(): Promise<GenreResponseDto[]> {
    return this.movieDao.findAllGenres();
  }

  async createGenre(dto: CreateGenreDto): Promise<GenreResponseDto> {
    const existing = await this.movieDao.findGenreByName(dto.name);
    if (existing) {
      throw new ConflictException(`El género '${dto.name}' ya existe.`);
    }
    return this.movieDao.createGenre(dto.name, dto.description);
  }

  async createShowtime(dto: CreateShowtimeDto) {
    const movie = await this.movieDao.findActiveMovieForShowtime(dto.movieId);
    if (!movie) throw new NotFoundException(`Película ${dto.movieId} no existe o no está ACTIVE.`);
    const room = await this.movieDao.findRoom(dto.roomId);
    if (!room) throw new NotFoundException(`Sala ${dto.roomId} no existe.`);
    const format = await this.movieDao.findFormat(dto.formatId);
    if (!format) throw new NotFoundException(`Formato ${dto.formatId} no existe.`);

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    if (end <= start) throw new BadRequestException('endTime debe ser mayor que startTime.');

    const overlap = await this.movieDao.hasOverlap(room.id, start, end);
    if (overlap) throw new ConflictException('Ya hay una función ACTIVE en esa sala y horario.');

    const totalSeats = dto.totalSeats ?? room.capacity;
    const finalPrice = dto.finalPrice ?? Number(dto.basePrice) + Number(format.surcharge ?? 0);

    return this.movieDao.createShowtime({
      movie, room, format, startTime: start, endTime: end,
      basePrice: dto.basePrice, finalPrice,
      totalSeats, availableSeats: totalSeats,
    });
  }

  // HU-005: GET /movies/upcoming — listado ordenado por fecha (RN-017, orden en DAO)
  async getUpcomingMovies(): Promise<UpcomingMovieResponseDto[]> {
    const movies = await this.movieDao.findUpcomingMovies();
    const today = this.startOfDay(new Date());
    return movies.map((movie) => this.mapToUpcomingCard(movie, today));
  }

  // HU-005: GET /movies/upcoming/:id — detalle solo si es UPCOMING (RN-017)
  async getUpcomingMovieById(id: number): Promise<UpcomingMovieResponseDto> {
    const movie = await this.movieDao.findUpcomingMovieById(id);
    if (!movie) {
      throw new NotFoundException('La película no está próxima a estrenarse.');
    }
    return this.mapToUpcomingCard(movie, this.startOfDay(new Date()));
  }

  // HU-005: POST /notifications/upcoming — RN-017 + RN-019
  async createUpcomingNotification(userId: number, movieId: number): Promise<UpcomingNotificationResponseDto> {
    const movie = await this.movieDao.findUpcomingMovieById(movieId);
    if (!movie) {
      throw new NotFoundException('La película no está próxima a estrenarse.');
    }
    const existing = await this.movieDao.findUpcomingNotification(userId, movieId);
    if (existing) {
      throw new ConflictException('Ya solicitaste notificación para esta película.');
    }
    const saved = await this.movieDao.saveUpcomingNotification(userId, movieId);
    return { id: saved.id, userId: saved.userId, movieId: saved.movieId, notified: saved.notified };
  }

  private mapToUpcomingCard(movie: Movie, date: Date): UpcomingMovieResponseDto {
    // Cada endpoint cumple su función: upcoming NO lleva formats/showtimes,
    // así no se envían campos vacíos. Incluye sinopsis, tráiler y conteo.
    return {
      id: movie.id,
      title: movie.title,
      originalTitle: movie.originalTitle,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl,
      synopsis: movie.synopsis,
      trailerUrl: movie.trailerUrl,
      duration: movie.duration,
      director: movie.director,
      genres: movie.genres ? movie.genres.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description,
      })) : [],
      classification: movie.classification ? {
        id: movie.classification.id,
        name: movie.classification.name,
        code: movie.classification.code,
        description: movie.classification.description,
        minimumAge: movie.classification.minimumAge,
      } : null,
      language: movie.language ? {
        id: movie.language.id,
        name: movie.language.name,
        code: movie.language.code,
      } : null,
      subtitleType: this.resolveSubtitleType(movie),
      isPremiere: movie.isPremiere,
      rating: Number(movie.rating),
      ratingCount: movie.ratingCount,
      releaseDate: movie.releaseDate,
      daysUntilRelease: this.daysUntil(movie.releaseDate, date),
    };
  }

  private resolveSubtitleType(movie: Movie): SubtitleType {
    let subtitleType: SubtitleType = SubtitleType.SUBTITLED;
    const langCode = movie.language?.code?.toUpperCase();
    const langName = movie.language?.name?.toLowerCase() ?? '';
    if (langCode === 'ES' || langName.includes('español') || langName.includes('espanol')) {
      subtitleType = SubtitleType.DUBBED;
    } else if (langCode === 'EN' || langName.includes('inglés') || langName.includes('ingles')) {
      subtitleType = SubtitleType.SUBTITLED;
    }
    return subtitleType;
  }

  private daysUntil(releaseDate: Date | null, from: Date): number {
    if (!releaseDate) return 0;
    const target = this.startOfDay(new Date(releaseDate));
    const diff = Math.ceil((target.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }
}