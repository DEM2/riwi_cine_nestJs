import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';
import { Movie } from '../entity/movie.entity.js';
import { MovieStatus } from '../enum/movie.enum.js';

@Injectable()
export class MovieDao {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async findActiveMovies(): Promise<Movie[]> {
    return this.movieRepository.find({
      where: { status: MovieStatus.ACTIVE },
      relations: ['genre', 'classification', 'language', 'showtimes', 'showtimes.format', 'showtimes.room', 'showtimes.room.theater'],
    });
  }

  async findMovieById(id: number): Promise<Movie | null> {
    return this.movieRepository.findOne({
      where: { id, status: MovieStatus.ACTIVE },
      relations: ['genre', 'classification', 'language', 'showtimes', 'showtimes.format', 'showtimes.room', 'showtimes.room.theater'],
    });
  }

  async findMoviesWithShowtimesInRange(startDate: Date, endDate: Date): Promise<Movie[]> {
    return this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.genre', 'genre')
      .leftJoinAndSelect('movie.classification', 'classification')
      .leftJoinAndSelect('movie.language', 'language')
      .leftJoinAndSelect('movie.showtimes', 'showtime')
      .leftJoinAndSelect('showtime.format', 'format')
      .leftJoinAndSelect('showtime.room', 'room')
      .leftJoinAndSelect('room.theater', 'theater')
      .leftJoinAndSelect('theater.city', 'city')
      .where('movie.status = :status', { status: MovieStatus.ACTIVE })
      .andWhere('showtime.status = :showtimeStatus', { showtimeStatus: 'ACTIVE' })
      .andWhere('showtime.startTime BETWEEN :startDate AND :endDate', { startDate, endDate })
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
      .leftJoinAndSelect('movie.genre', 'genre')
      .leftJoinAndSelect('movie.classification', 'classification')
      .leftJoinAndSelect('movie.language', 'language')
      .leftJoinAndSelect('movie.showtimes', 'showtime')
      .leftJoinAndSelect('showtime.format', 'format')
      .leftJoinAndSelect('showtime.room', 'room')
      .leftJoinAndSelect('room.theater', 'theater')
      .leftJoinAndSelect('theater.city', 'city')
      .where('movie.status = :status', { status: MovieStatus.ACTIVE })
      .andWhere('showtime.status = :showtimeStatus', { showtimeStatus: 'ACTIVE' })
      .andWhere('showtime.startTime BETWEEN :startDate AND :endDate', { 
        startDate: filters.startDate, 
        endDate: filters.endDate 
      });

    if (filters.genreId) {
      query.andWhere('movie.genreId = :genreId', { genreId: filters.genreId });
    }

    if (filters.classificationId) {
      query.andWhere('movie.classificationId = :classificationId', { classificationId: filters.classificationId });
    }

    if (filters.languageId) {
      query.andWhere('movie.languageId = :languageId', { languageId: filters.languageId });
    }

    if (filters.roomType) {
      query.andWhere('room.type = :roomType', { roomType: filters.roomType });
    }

    if (filters.formatCode) {
      query.andWhere('format.code = :formatCode', { formatCode: filters.formatCode });
    }

    if (filters.theaterId) {
      query.andWhere('theater.id = :theaterId', { theaterId: filters.theaterId });
    }

    if (filters.cityId) {
      query.andWhere('city.id = :cityId', { cityId: filters.cityId });
    }

    if (filters.onlyAvailable) {
      query.andWhere('showtime.availableSeats > 0');
    }

    if (filters.onlyPremieres) {
      query.andWhere('movie.isPremiere = :isPremiere', { isPremiere: true });
    }

    return query
      .orderBy('movie.title', 'ASC')
      .addOrderBy('showtime.startTime', 'ASC')
      .getMany();
  }

  async findAllGenres() {
    return this.movieRepository.manager.getRepository('genres').find();
  }

  async findAllClassifications() {
    return this.movieRepository.manager.getRepository('classifications').find();
  }

  async findAllLanguages() {
    return this.movieRepository.manager.getRepository('languages').find();
  }

  async findAllFormats() {
    return this.movieRepository.manager.getRepository('formats').find();
  }

  async findAllTheaters(cityId?: number) {
    const repo = this.movieRepository.manager.getRepository('theaters');
    if (cityId) {
      return repo.find({ where: { city: { id: cityId }, isActive: true }, relations: ['rooms'] });
    }
    return repo.find({ where: { isActive: true }, relations: ['rooms'] });
  }
}