import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { SeatLock } from '../entity/seat-lock.entity.js';

/**
 * Datos necesarios para crear un bloqueo de silla.
 */
export interface SeatLockCreateData {
  cartId: number;
  showtimeId: number;
  seatId: number;
  price: number;
  expiresAt: Date;
}

/**
 * DAO de sillas bloqueadas (SeatLock).
 *
 * Vigencia (RN-039/RN-040): un bloqueo está vigente solo si
 * `expiresAt > NOW()`. Los bloqueos con `expiresAt` nulo se tratan como
 * expirados.
 */
@Injectable()
export class SeatLockDao {
  constructor(
    @InjectRepository(SeatLock)
    private readonly seatLockRepository: Repository<SeatLock>,
  ) {}

  private repository(manager?: EntityManager): Repository<SeatLock> {
    return manager
      ? manager.getRepository(SeatLock)
      : this.seatLockRepository;
  }

  /**
   * Obtiene todos los bloqueos vigentes de una función.
   */
  async findLockedByShowtime(
    showtimeId: number,
    manager?: EntityManager,
  ): Promise<SeatLock[]> {
    return this.repository(manager).find({
      where: {
        showtime: { id: showtimeId },
        expiresAt: MoreThan(new Date()),
      },
      relations: { seat: true },
    });
  }

  /**
   * Obtiene los bloqueos vigentes de un carrito para una función.
   */
  async findValidByCartAndShowtime(
    cartId: number,
    showtimeId: number,
    manager?: EntityManager,
  ): Promise<SeatLock[]> {
    return this.repository(manager).find({
      where: {
        cartId,
        showtime: { id: showtimeId },
        expiresAt: MoreThan(new Date()),
      },
      relations: { seat: true },
    });
  }

  /**
   * Obtiene los bloqueos vigentes de un carrito con los detalles de la
   * función y de la silla (incluido su tipo) para construir el resumen.
   */
  async findValidByCartAndShowtimeWithDetails(
    cartId: number,
    showtimeId: number,
  ): Promise<SeatLock[]> {
    return this.seatLockRepository.find({
      where: {
        cartId,
        showtime: { id: showtimeId },
        expiresAt: MoreThan(new Date()),
      },
      relations: {
        showtime: { movie: true, room: true },
        seat: { seatType: true },
      },
    });
  }

  /**
   * Elimina los bloqueos expirados (incluye los que no tienen `expiresAt`).
   *
   * @returns Cantidad de filas eliminadas.
   */
  async deleteExpired(manager?: EntityManager): Promise<number> {
    const repository = this.repository(manager);

    const expired = await repository.delete({
      expiresAt: LessThanOrEqual(new Date()),
    });

    const legacy = await repository
      .createQueryBuilder()
      .delete()
      .where('"expiresAt" IS NULL')
      .execute();

    return (expired.affected ?? 0) + (legacy.affected ?? 0);
  }

  /**
   * Inserta los bloqueos indicados.
   */
  async lockSeats(
    rows: SeatLockCreateData[],
    manager?: EntityManager,
  ): Promise<SeatLock[]> {
    const repository = this.repository(manager);

    const entities = rows.map((row) =>
      repository.create({
        cartId: row.cartId,
        price: row.price,
        expiresAt: row.expiresAt,
        showtime: { id: row.showtimeId },
        seat: { id: row.seatId },
      }),
    );

    return repository.save(entities);
  }

  /**
   * Libera (elimina) las sillas indicadas de un carrito/función.
   *
   * @returns Cantidad de filas eliminadas.
   */
  async releaseSeats(
    cartId: number,
    showtimeId: number,
    seatIds: number[],
  ): Promise<number> {
    if (seatIds.length === 0) {
      return 0;
    }

    const result = await this.seatLockRepository
      .createQueryBuilder()
      .delete()
      .where('"cartId" = :cartId', { cartId })
      .andWhere('"showtimeId" = :showtimeId', { showtimeId })
      .andWhere('"seatId" IN (:...seatIds)', { seatIds })
      .execute();

    return result.affected ?? 0;
  }
}
