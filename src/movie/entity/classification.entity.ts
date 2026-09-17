import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import type { Movie } from './movie.entity.js';

@Entity('classifications')
export class Classification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  minimumAge: number;

  @OneToMany('Movie', 'classification')
  movies: Movie[];
}