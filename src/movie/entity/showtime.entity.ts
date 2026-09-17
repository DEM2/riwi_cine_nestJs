import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import type { Movie } from './movie.entity.js';
import type { Format } from './format.entity.js';
import type { Room } from './room.entity.js';
import type { Ticket } from '../../ticket/entity/ticket.entity.js';
import { ShowtimeStatus } from '../enum/movie.enum.js';

@Entity('showtimes')
@Index(['movie', 'startTime', 'room'])
@Index(['theater', 'startTime'])
export class Showtime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  basePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  finalPrice: number;

  @Column({ default: 0 })
  availableSeats: number;

  @Column({ default: 0 })
  totalSeats: number;

  @Column({
    type: 'enum',
    enum: ShowtimeStatus,
    default: ShowtimeStatus.ACTIVE,
  })
  status: ShowtimeStatus;

  @ManyToOne('Movie', 'showtimes', { onDelete: 'CASCADE' })
  movie: Movie;

  @ManyToOne('Format', 'showtimes', { nullable: true })
  format: Format;

  @ManyToOne('Room', 'showtimes', { nullable: true })
  room: Room;

  @OneToMany('Ticket', 'showtime')
  tickets: Ticket[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}