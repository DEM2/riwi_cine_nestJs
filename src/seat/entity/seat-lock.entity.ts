import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
  CreateDateColumn,
} from 'typeorm';
import type { Showtime } from '../../movie/entity/showtime.entity.js';
import type { Seat } from './seat.entity.js';

/**
 * Bloqueo temporal de una silla para un carrito en una función.
 *
 * Vigencia (RN-039/RN-040): un bloqueo está vigente solo si
 * `expiresAt > NOW()`. Las filas expiradas se purgan con el job de limpieza,
 * aunque la corrección no depende de él: toda lectura filtra por vigencia.
 *
 * La restricción única (`showtime`, `seat`) es el mecanismo de control de
 * concurrencia que impide sobreventas (RN-043).
 */
@Entity('seat_locks')
@Unique(['showtime', 'seat'])
@Index(['showtime'])
@Index(['expiresAt'])
export class SeatLock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  cartId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @CreateDateColumn()
  lockedAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @ManyToOne('Showtime', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'showtimeId' })
  showtime: Showtime;

  @ManyToOne('Seat', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seatId' })
  seat: Seat;
}
