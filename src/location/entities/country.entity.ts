import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Department } from "./department.entity.js";
@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Department, (department) => department.country)
  departments: Department[];
}