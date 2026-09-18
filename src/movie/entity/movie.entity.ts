import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import type { Genre } from './genre.entity.js';
import type { Classification } from './classification.entity.js';
import type { Language } from './language.entity.js';
import type { Showtime } from './showtime.entity.js';
import { MovieStatus } from '../enum/movie.enum.js';
import { ManyToMany} from 'typeorm';
import { JoinTable } from 'typeorm';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  originalTitle: string;

  @Column({ nullable: true, type: 'text' })
  synopsis: string;

  @Column({ nullable: true })
  posterUrl: string;

  @Column({ nullable: true })
  backdropUrl: string;

  @Column({ nullable: true })
  trailerUrl: string;

  @Column({ type: 'int', default: 0 })
  duration: number;

  @Column({ nullable: true })
  director: string;

  @Column({ nullable: true })
  cast: string;

  @Column({ type: 'date', nullable: true })
  releaseDate: Date;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @Column({
    type: 'enum',
    enum: MovieStatus,
    default: MovieStatus.ACTIVE,
  })
  status: MovieStatus;

  @Column({ default: false })
  isPremiere: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @ManyToMany('Genre', 'movie')
  @JoinTable({
    name:'movie_genres',
    joinColumn:{
      name:'movieId',
      referencedColumnName:'id',
    },inverseJoinColumn:{
      name:'genreId',
      referencedColumnName:'id'
    },
  })
  genres : Genre[];

  @ManyToOne('Classification', 'movies', { nullable: true })
  classification: Classification;

  @ManyToOne('Language', 'movies', { nullable: true })
  language: Language;

  @OneToMany('Showtime', 'movie')
  showtimes: Showtime[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}