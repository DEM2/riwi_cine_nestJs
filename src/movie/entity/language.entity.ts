import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import type { Movie } from './movie.entity.js';

@Entity('languages')
export class Language {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: string;

  @OneToMany('Movie', 'language')
  movies: Movie[];
}