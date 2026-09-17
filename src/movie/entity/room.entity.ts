import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import type { Theater } from './theater.entity.js';
import type { Showtime } from './showtime.entity.js';
import { RoomType } from '../enum/movie.enum.js';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  number: number;

  @Column({ default: 0 })
  capacity: number;

  @Column({
    type: 'enum',
    enum: RoomType,
    default: RoomType.STANDARD,
  })
  type: RoomType;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne('Theater', 'rooms')
  theater: Theater;

  @OneToMany('Showtime', 'room')
  showtimes: Showtime[];
}