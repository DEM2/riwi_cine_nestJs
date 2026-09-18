import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import type { Movie } from './movie.entity.js';

@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany('Movie', 'genre')
  movies: Movie[];
}