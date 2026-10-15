import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service.js';
import { SeatType } from '../seat/entity/seat-type.entity.js';
import { Seat } from '../seat/entity/seat.entity.js';
import { Country } from '../location/country/country.entity.js';
import { Department } from '../location/department/department.entity.js';
import { City } from '../location/city/city.entity.js';
import { Theater } from '../movie/entity/theater.entity.js';
import { Room } from '../movie/entity/room.entity.js';
import { Movie } from '../movie/entity/movie.entity.js';
import { Format } from '../movie/entity/format.entity.js';
import { Showtime } from '../movie/entity/showtime.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SeatType,
      Seat,
      Country,
      Department,
      City,
      Theater,
      Room,
      Movie,
      Format,
      Showtime,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
