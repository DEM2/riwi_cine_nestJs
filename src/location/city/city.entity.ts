import type { Department } from '../department/department.entity.js';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToOne('Department', 'cities')
  department: Department;
}
