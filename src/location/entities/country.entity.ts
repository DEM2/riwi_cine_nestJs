import type { Department } from "./department.entity.js";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany('Department', 'country')
  departments: Department[];
}