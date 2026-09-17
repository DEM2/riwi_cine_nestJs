import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import type { Room } from './room.entity.js';
import type { City } from '../../location/city/city.entity.js';

@Entity('theaters')
export class Theater {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne('City', { nullable: true })
  city: City;

  @OneToMany('Room', 'theater')
  rooms: Room[];
}