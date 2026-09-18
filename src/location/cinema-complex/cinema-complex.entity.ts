import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { City } from '../city/city.entity.js';

@Entity('cinema_complexes')
@Unique(['name', 'city'])
@Unique(['address', 'city'])
export class CinemaComplex {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => City)
  city: City;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}