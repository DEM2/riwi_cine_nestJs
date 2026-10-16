import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

export enum SeatLockAuditAction {
  LOCKED = 'LOCKED',
  RELEASED = 'RELEASED',
  EXPIRED = 'EXPIRED',
}

/**
 * Registro de auditoría de bloqueos y liberaciones de sillas (HU-010).
 *
 * Guarda los identificadores como columnas simples, sin llaves foráneas, para
 * que el historial se conserve aunque la función o la silla se eliminen.
 */
@Entity('seat_lock_audits')
@Index(['showtimeId', 'seatId'])
@Index(['cartId'])
export class SeatLockAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: SeatLockAuditAction })
  action: SeatLockAuditAction;

  @Column({ type: 'int' })
  cartId: number;

  @Column({ type: 'int' })
  showtimeId: number;

  @Column({ type: 'int' })
  seatId: number;

  @CreateDateColumn()
  createdAt: Date;
}
