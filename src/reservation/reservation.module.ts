import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller.js';
import { ReservationService } from './reservation.service.js';
import { SeatLockPurgerService } from './seat-lock-purger.service.js';
import { SeatModule } from '../seat/seat.module.js';
import { FunctionModule } from '../function/function.module.js';

@Module({
  imports: [SeatModule, FunctionModule],
  controllers: [ReservationController],
  providers: [ReservationService, SeatLockPurgerService],
})
export class ReservationModule {}
