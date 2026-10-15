import { Injectable } from '@nestjs/common';
import { ShowtimeDao } from './dao/showtime.dao.js';
import { SeatDao } from '../seat/dao/seat.dao.js';
import { SeatLockDao } from '../seat/dao/seat-lock.dao.js';
import { ShowtimeSeatResponseDto } from './dto/seat-response.dto.js';
import { assertShowtimeSelectable, resolveFinalPrice } from './showtime.util.js';

/**
 * Servicio de Funciones. Contiene la lógica de negocio del mapa de sillas de
 * una función.
 */
@Injectable()
export class FunctionService {
  constructor(
    private readonly showtimeDao: ShowtimeDao,
    private readonly seatDao: SeatDao,
    private readonly seatLockDao: SeatLockDao,
  ) {}

  /**
   * Obtiene el mapa de sillas habilitadas de una función con su estado
   * (disponible o bloqueada) y su precio calculado.
   */
  async getShowtimeSeats(
    showtimeId: number,
  ): Promise<ShowtimeSeatResponseDto[]> {
    const showtime = await this.showtimeDao.findById(showtimeId);
    assertShowtimeSelectable(showtime);

    const finalPrice = resolveFinalPrice(showtime);
    const seats = await this.seatDao.findEnabledByRoomWithType(showtime.room.id);
    const locked = await this.seatLockDao.findLockedByShowtime(showtimeId);

    const lockedBySeat = new Map<number, number>();
    for (const lock of locked) {
      lockedBySeat.set(lock.seat.id, lock.cartId);
    }

    return seats.map((seat) => ({
      id: seat.id,
      code: seat.code,
      rowLabel: seat.rowLabel,
      seatNumber: seat.seatNumber,
      seatType: seat.seatType
        ? {
            id: seat.seatType.id,
            code: seat.seatType.code,
            name: seat.seatType.name,
          }
        : null,
      status: lockedBySeat.has(seat.id) ? 'locked' : 'available',
      lockedByCartId: lockedBySeat.get(seat.id) ?? null,
      price: finalPrice + Number(seat.seatType?.extraCharge ?? 0),
    }));
  }
}
