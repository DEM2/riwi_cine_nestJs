import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from './entity/seat.entity.js';
import { SeatType } from './entity/seat-type.entity.js';
import { SeatLock } from './entity/seat-lock.entity.js';
import { SeatDao } from './dao/seat.dao.js';
import { SeatLockDao } from './dao/seat-lock.dao.js';

/**
 * Módulo de sillas. Registra las entidades `Seat`, `SeatType` y `SeatLock`
 * y expone sus DAOs para los módulos de funciones y reservas.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Seat, SeatType, SeatLock])],
  providers: [SeatDao, SeatLockDao],
  exports: [SeatDao, SeatLockDao],
})
export class SeatModule {}
