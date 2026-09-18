
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../entity/movie.entity.js';
import { MovieStatus } from '../enum/movie.enum.js';
import { CreateMovieDto } from '../dto/create-movie.dto.js';
import { Genre } from '../entity/genre.entity.js';
import { Classification } from '../entity/classification.entity.js';
import { Language } from '../entity/language.entity.js';

@Injectable()
export class MovieDao {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,

    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,

    @InjectRepository(Classification)
    private readonly classificationRepository: Repository<Classification>,

    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  async findActiveMovies(): Promise<Movie[]> {
    return this.movieRepository.find({
      where: {
        status: MovieStatus.ACTIVE,
      },
      relations: {
        genres: true,
        classification: true,
        language: true,
        showtimes: {
          format: true,
          room: {
            theater: true,
          },
        },
      },
    });
  }

  async findMovieById(id: number): Promise<Movie | null> {
    return this.movieRepository.findOne({
      where: {
        id,
        status: MovieStatus.ACTIVE,
      },
      relations: {
        genres: true,
        classification: true,
        language: true,
        showtimes: {
          format: true,
          room: {
            theater: true,
          },
        },
      },
    });
  }

  async findMoviesWithShowtimesInRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Movie[]> {
    return this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.genres', 'genre')
      .leftJoinAndSelect('movie.classification', 'classification')
      .leftJoinAndSelect('movie.language', 'language')
      .leftJoinAndSelect('movie.showtimes', 'showtime', `showtime.status = :showtimeStatus AND showtime.startTime BETWEEN :startDate AND :endDate`)
      .leftJoinAndSelect('showtime.format', 'format')
      .leftJoinAndSelect('showtime.room', 'room')
      .leftJoinAndSelect('room.theater', 'theater')
      .leftJoinAndSelect('theater.city', 'city')
      .setParameter('showtimeStatus', 'ACTIVE')
      .setParameter('startDate', startDate)
      .setParameter('endDate', endDate)
      .where('movie.status = :status', {
        status: MovieStatus.ACTIVE,
      })
      .orderBy('movie.title', 'ASC')
      .addOrderBy('showtime.startTime', 'ASC')
      .getMany();
  }

  async findMoviesWithFilters(filters: {
    startDate: Date;
    endDate: Date;
    genreId?: number;
    classificationId?: number;
    languageId?: number;
    roomType?: string;
    formatCode?: string;
    theaterId?: number;
    cityId?: number;
    onlyAvailable?: boolean;
    onlyPremieres?: boolean;
  }): Promise<Movie[]> {
    const query = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.genres', 'genre')
      .leftJoinAndSelect('movie.classification', 'classification')
      .leftJoinAndSelect('movie.language', 'language')
      .leftJoinAndSelect('movie.showtimes', 'showtime', `showtime.status = :showtimeStatus AND showtime.startTime BETWEEN :startDate AND :endDate`)
      .leftJoinAndSelect('showtime.format', 'format')
      .leftJoinAndSelect('showtime.room', 'room')
      .leftJoinAndSelect('room.theater', 'theater')
      .leftJoinAndSelect('theater.city', 'city')
      .setParameter('showtimeStatus', 'ACTIVE')
      .setParameter('startDate', filters.startDate)
      .setParameter('endDate', filters.endDate)
      .where('movie.status = :status', {
        status: MovieStatus.ACTIVE,
      });

    if (filters.genreId) {
      query.andWhere('genre.id = :genreId', {
        genreId: filters.genreId,
      });
    }

    if (filters.classificationId) {
      query.andWhere(
        'movie.classificationId = :classificationId',
        {
          classificationId: filters.classificationId,
        },
      );
    }

    if (filters.languageId) {
      query.andWhere('movie.languageId = :languageId', {
        languageId: filters.languageId,
      });
    }

    if (filters.roomType) {
      query.andWhere('room.type = :roomType', {
        roomType: filters.roomType,
      });
    }

    if (filters.formatCode) {
      query.andWhere('format.code = :formatCode', {
        formatCode: filters.formatCode,
      });
    }

    if (filters.theaterId) {
      query.andWhere('theater.id = :theaterId', {
        theaterId: filters.theaterId,
      });
    }

    if (filters.cityId) {
      query.andWhere('city.id = :cityId', {
        cityId: filters.cityId,
      });
    }

    if (filters.onlyAvailable) {
      query.andWhere('showtime.availableSeats > 0');
    }

    if (filters.onlyPremieres) {
      query.andWhere('movie.isPremiere = :isPremiere', {
        isPremiere: true,
      });
    }

    return query
      .orderBy('movie.title', 'ASC')
      .addOrderBy('showtime.startTime', 'ASC')
      .getMany();
  }

  async findAllGenres() {
    return this.genreRepository.find();
  }

  async findAllClassifications() {
    return this.classificationRepository.find();
  }

  async findAllLanguages() {
    return this.languageRepository.find();
  }

  async findAllFormats() {
    return this.movieRepository.manager
      .getRepository('formats')
      .find();
  }

  async findAllTheaters(cityId?: number) {
    const repo = this.movieRepository.manager.getRepository('theaters');

    if (cityId) {
      return repo.find({
        where: {
          city: { id: cityId },
          isActive: true,
        },
        relations: {
          rooms: true,
        },
      });
    }

    return repo.find({
      where: {
        isActive: true,
      },
      relations: {
        rooms: true,
      },
    });
  }

  createMovie(dto: CreateMovieDto): Movie {
    const movie = new Movie();

    movie.title = dto.title;
    movie.originalTitle = dto.original_title;
    movie.synopsis = dto.synopsis;
    movie.posterUrl = dto.poster;
    movie.backdropUrl = dto.banner_url ?? '';
    movie.trailerUrl = dto.trailer_url;
    movie.duration = dto.duration_minutes;
    movie.director = dto.director;

    movie.cast =
      dto.cast
        ?.map(
          (c) =>
            `${c.actorName}${c.roleName ? ` as ${c.roleName}` : ''}`,
        )
        .join(', ') ?? '';

    movie.releaseDate = dto.release_date
      ? new Date(dto.release_date)
      : (null as any);

    movie.status = dto.status ?? MovieStatus.ACTIVE;
    movie.isPremiere = dto.premiere ?? false;
    movie.isFeatured = dto.is_release ?? false;
    movie.rating = dto.audience_rating ?? 0;

    // Múltiples géneros
    if (dto.genres && dto.genres.length > 0) {
      movie.genres = dto.genres.map(
        (id) => ({ id }) as Genre,
      );
    }

    // Classification
    if (dto.rating) {
      movie.classification = {
        code: dto.rating,
      } as Classification;
    }

    // Language
    if (dto.language) {
      movie.language = {
        name: dto.language,
      } as Language;
    }

    return movie;
  }

  async saveMovie(movie: Movie): Promise<Movie> {
    return this.movieRepository.save(movie);
  }
async findMovieByTitleAndReleaseDate(
  title: string,
  releaseDate: Date,
): Promise<Movie | null> {
  return this.movieRepository.findOne({
    where: {
      title,
      releaseDate,
    },
  });
}
}
