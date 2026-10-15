import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Room } from '../../movie/entity/room.entity.js';
import type { SeatType } from './seat-type.entity.js';

/**
 * Silla física de una sala de cine.
 *
 * La posición se identifica por `rowLabel` (fila) y `seatNumber` (número dentro
 * de la fila). El estado transitorio por función (disponible, bloqueada) se
 * maneja en `SeatLock`; `isEnabled` indica si la silla está habilitada
 * físicamente.
 */
@Entity('seats')
@Unique(['room', 'rowLabel', 'seatNumber'])
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 5 })
  rowLabel: string;

  @Column({ type: 'int' })
  seatNumber: number;

  @Column({ length: 10 })
  code: string;

  @Column({ default: true })
  isEnabled: boolean;

  @ManyToOne('Room', 'seats')
  room: Room;

  @ManyToOne('SeatType', 'seats')
  seatType: SeatType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
