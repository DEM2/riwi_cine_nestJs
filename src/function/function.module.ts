import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FunctionController } from './function.controller.js';
import { FunctionService } from './function.service.js';
import { ShowtimeDao } from './dao/showtime.dao.js';
import { SeatModule } from '../seat/seat.module.js';
import { Showtime } from '../movie/entity/showtime.entity.js';
import { Format } from '../movie/entity/format.entity.js';
import { Room } from '../movie/entity/room.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Showtime, Format, Room]),
    SeatModule,
  ],
  controllers: [FunctionController],
  providers: [FunctionService, ShowtimeDao],
  exports: [ShowtimeDao],
})
export class FunctionModule {}
