import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieController } from './movie.controller.js';
import { MovieService } from './movie.service.js';
import { MovieDao } from './dao/movie.dao.js';
import { Movie } from './entity/movie.entity.js';
import { Showtime } from './entity/showtime.entity.js';
import { Genre } from './entity/genre.entity.js';
import { Classification } from './entity/classification.entity.js';
import { Language } from './entity/language.entity.js';
import { Format } from './entity/format.entity.js';
import { Theater } from './entity/theater.entity.js';
import { Room } from './entity/room.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movie,
      Showtime,
      Genre,
      Classification,
      Language,
      Format,
      Theater,
      Room,
    ]),
  ],
  controllers: [MovieController],
  providers: [MovieService, MovieDao],
  exports: [MovieService],
})
export class MovieModule {}