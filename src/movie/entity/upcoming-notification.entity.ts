import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique, JoinColumn } from 'typeorm';
import type { Movie } from './movie.entity.js';

@Entity('upcoming_notifications')
@Unique(['userId', 'movieId'])
export class UpcomingNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int' })
  movieId: number;

  @ManyToOne('Movie', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movieId' })
  movie: Movie;

  @Column({ default: false })
  notified: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
