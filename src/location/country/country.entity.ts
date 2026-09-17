import type { Department } from "../department/department.entity.js";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany('Department', 'country')
  departments: Department[];
}