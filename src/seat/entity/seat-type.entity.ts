import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Seat } from './seat.entity.js';

/**
 * Tipo de silla (Estándar, Preferencial, Accesible, Acompañante, VIP).
 *
 * El `extraCharge` representa el recargo que se suma al precio final de la
 * función para calcular el precio de la entrada de una silla de este tipo.
 */
@Entity('seat_types')
export class SeatType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  extraCharge: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany('Seat', 'seatType')
  seats: Seat[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
