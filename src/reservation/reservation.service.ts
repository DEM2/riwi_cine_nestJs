import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, QueryFailedError } from 'typeorm';
import { SeatDao } from '../seat/dao/seat.dao.js';
import { SeatLockDao } from '../seat/dao/seat-lock.dao.js';
import { SeatLock } from '../seat/entity/seat-lock.entity.js';
import { getMaxTicketsPerShowtime, getSeatLockTtlMinutes } from '../seat/seat-lock.config.js';
import { ShowtimeDao } from '../function/dao/showtime.dao.js';
import { assertShowtimeSelectable, resolveFinalPrice } from '../function/showtime.util.js';
import { LockSeatsDto } from './dto/lock-seats.dto.js';
import { ReleaseSeatsDto } from './dto/release-seats.dto.js';
import {
  LockSeatsResponseDto,
  LockedSeatResponseDto,
  ReservationSummaryResponseDto,
} from './dto/reservation-response.dto.js';

/**
 * Servicio de Reservas. Contiene la lógica de negocio del bloqueo/liberación
 * de sillas de una función y de la consulta del resumen de reserva.
 */
@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);

  constructor(
    private readonly seatDao: SeatDao,
    private readonly seatLockDao: SeatLockDao,
    private readonly showtimeDao: ShowtimeDao,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Bloquea un conjunto de sillas de una función para un carrito.
   *
   * Semántica del timer (RN-039): el tiempo inicia con el primer bloqueo del
   * carrito para la función y no se extiende con posteriores; los nuevos
   * bloqueos heredan el mismo `expiresAt`.
   *
   * Idempotente por carrito: si una silla ya está bloqueada por el mismo
   * `cartId`, se ignora. Solo se devuelve 409 si está bloqueada por otro
   * carrito con un bloqueo vigente.
   */
  async lockSeats(dto: LockSeatsDto): Promise<LockSeatsResponseDto> {
    const seatIds = [...new Set(dto.seatIds)];
    if (seatIds.length === 0) {
      throw new BadRequestException('Debes indicar al menos una silla.');
    }

    const showtime = await this.showtimeDao.findById(dto.showtimeId);
    assertShowtimeSelectable(showtime);
    const finalPrice = resolveFinalPrice(showtime);

    const seats = await this.seatDao.findByIdsWithType(seatIds);
    const seatMap = new Map(seats.map((seat) => [seat.id, seat]));

    for (const seatId of seatIds) {
      const seat = seatMap.get(seatId);
      if (!seat) {
        throw new BadRequestException(`La silla ${seatId} no existe.`);
      }
      if (!seat.isEnabled) {
        throw new BadRequestException(`La silla ${seat.code} está inhabilitada.`);
      }
      if (seat.room.id !== showtime.room.id) {
        throw new BadRequestException(
          `La silla ${seat.code} no pertenece a la sala de la función.`,
        );
      }
    }

    const ttlMinutes = getSeatLockTtlMinutes(this.configService);
    const maxTickets = getMaxTicketsPerShowtime(this.configService);

    try {
      return await this.dataSource.transaction(async (manager) => {
        await this.seatLockDao.deleteExpired(manager);

        const locked = await this.seatLockDao.findLockedByShowtime(
          dto.showtimeId,
          manager,
        );
        const mine = locked.filter((lock) => lock.cartId === dto.cartId);
        const mineSeatIds = new Set(mine.map((lock) => lock.seat.id));
        const othersLockedBySeat = new Set(
          locked
            .filter((lock) => lock.cartId !== dto.cartId)
            .map((lock) => lock.seat.id),
        );

        const toInsert = seatIds.filter((seatId) => !mineSeatIds.has(seatId));

        const conflict = seatIds.find((seatId) =>
          othersLockedBySeat.has(seatId),
        );
        if (conflict !== undefined) {
          throw new ConflictException(
            'Una o más sillas ya están bloqueadas.',
          );
        }

        if (mine.length + toInsert.length > maxTickets) {
          throw new BadRequestException(
            `No puedes seleccionar más de ${maxTickets} entradas para esta función.`,
          );
        }

        if (toInsert.length === 0) {
          return this.buildLockResult(mine, dto.showtimeId);
        }

        const cartExpiresAt =
          mine[0]?.expiresAt ??
          new Date(Date.now() + ttlMinutes * 60_000);

        const rows = toInsert.map((seatId) => ({
          cartId: dto.cartId,
          showtimeId: dto.showtimeId,
          seatId,
          price:
            finalPrice +
            Number(seatMap.get(seatId)!.seatType?.extraCharge ?? 0),
          expiresAt: cartExpiresAt,
        }));

        const created = await this.seatLockDao.lockSeats(rows, manager);

        return this.buildLockResult([...mine, ...created], dto.showtimeId);
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'Una o más sillas ya están bloqueadas.',
        );
      }
      throw error;
    }
  }

  /**
   * Libera un conjunto de sillas previamente bloqueadas por un carrito.
   */
  async releaseSeats(dto: ReleaseSeatsDto): Promise<number> {
    const deleted = await this.seatLockDao.releaseSeats(
      dto.cartId,
      dto.showtimeId,
      dto.seatIds,
    );

    if (deleted === 0) {
      throw new NotFoundException(
        'No se encontraron sillas bloqueadas para liberar.',
      );
    }

    return deleted;
  }

  /**
   * Obtiene el resumen de las sillas bloqueadas por un carrito para una función.
   */
  async getReservationSummary(
    cartId: number,
    showtimeId: number,
  ): Promise<ReservationSummaryResponseDto> {
    const locks = await this.seatLockDao.findValidByCartAndShowtimeWithDetails(
      cartId,
      showtimeId,
    );

    if (!locks || locks.length === 0) {
      throw new NotFoundException(
        'No hay sillas bloqueadas para este carrito y función.',
      );
    }

    const showtime = locks[0].showtime;
    const seats = locks.map((lock) => ({
      id: lock.seat.id,
      code: lock.seat.code,
      rowLabel: lock.seat.rowLabel,
      seatNumber: lock.seat.seatNumber,
      seatType: lock.seat.seatType?.name ?? 'Estándar',
      price: Number(lock.price),
    }));

    const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);

    return {
      cartId,
      showtime: {
        id: showtime.id,
        movieId: showtime.movie?.id ?? null,
        roomId: showtime.room?.id ?? null,
        startTime: showtime.startTime,
        endTime: showtime.endTime,
        basePrice: Number(showtime.basePrice),
      },
      seats,
      totalSeats: seats.length,
      totalAmount,
      expiresAt: locks[0].expiresAt,
    };
  }

  private buildLockResult(
    locks: SeatLock[],
    showtimeId: number,
  ): LockSeatsResponseDto {
    const seats: LockedSeatResponseDto[] = locks.map((lock) => ({
      seatId: lock.seat.id,
      cartId: lock.cartId,
      showtimeId,
      price: Number(lock.price),
      expiresAt: lock.expiresAt,
    }));

    const total = seats.reduce((sum, seat) => sum + seat.price, 0);

    return { seats, total };
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = (error as QueryFailedError & {
      driverError?: { code?: string };
    }).driverError;

    return driverError?.code === '23505';
  }
}
