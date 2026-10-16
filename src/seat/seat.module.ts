import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from './entity/seat.entity.js';
import { SeatType } from './entity/seat-type.entity.js';
import { SeatLock } from './entity/seat-lock.entity.js';
import { SeatLockAudit } from './entity/seat-lock-audit.entity.js';
import { SeatDao } from './dao/seat.dao.js';
import { SeatLockDao } from './dao/seat-lock.dao.js';
import { SeatLockAuditDao } from './dao/seat-lock-audit.dao.js';

/**
 * Módulo de sillas. Registra las entidades `Seat`, `SeatType`, `SeatLock` y
 * `SeatLockAudit` y expone sus DAOs para los módulos de funciones y reservas.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Seat, SeatType, SeatLock, SeatLockAudit])],
  providers: [SeatDao, SeatLockDao, SeatLockAuditDao],
  exports: [SeatDao, SeatLockDao, SeatLockAuditDao],
})
export class SeatModule {}
