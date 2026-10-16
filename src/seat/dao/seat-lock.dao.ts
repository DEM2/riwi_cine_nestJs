import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, MoreThan, Repository } from 'typeorm';
import { SeatLock } from '../entity/seat-lock.entity.js';
import type { SeatLockRef } from './seat-lock-audit.dao.js';

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
   * @returns Las sillas cuyo bloqueo fue eliminado.
   */
  async deleteExpired(manager?: EntityManager): Promise<SeatLockRef[]> {
    const result = await this.repository(manager)
      .createQueryBuilder()
      .delete()
      .where('"expiresAt" <= :now OR "expiresAt" IS NULL', { now: new Date() })
      .returning(RETURNING_REF_COLUMNS)
      .execute();

    return toRefs(result.raw);
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
   * @returns Las sillas cuyo bloqueo fue eliminado.
   */
  async releaseSeats(
    cartId: number,
    showtimeId: number,
    seatIds: number[],
    manager?: EntityManager,
  ): Promise<SeatLockRef[]> {
    if (seatIds.length === 0) {
      return [];
    }

    const result = await this.repository(manager)
      .createQueryBuilder()
      .delete()
      .where('"cartId" = :cartId', { cartId })
      .andWhere('"showtimeId" = :showtimeId', { showtimeId })
      .andWhere('"seatId" IN (:...seatIds)', { seatIds })
      .returning(RETURNING_REF_COLUMNS)
      .execute();

    return toRefs(result.raw);
  }
}

const RETURNING_REF_COLUMNS = '"cartId", "showtimeId", "seatId"';

function toRefs(raw: unknown): SeatLockRef[] {
  const rows = Array.isArray(raw) ? raw : [];
  return rows.map((row: Record<string, unknown>) => ({
    cartId: Number(row.cartId),
    showtimeId: Number(row.showtimeId),
    seatId: Number(row.seatId),
  }));
}
