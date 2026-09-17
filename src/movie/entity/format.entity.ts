import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import type { Showtime } from './showtime.entity.js';
import { MovieFormat } from '../enum/movie.enum.js';

@Entity('formats')
export class Format {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: MovieFormat,
    unique: true,
  })
  code: MovieFormat;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  surcharge: number;

  @OneToMany('Showtime', 'format')
  showtimes: Showtime[];
}