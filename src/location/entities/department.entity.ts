import type { City } from "./city.entity.js";
import type { Country } from "./country.entity.js";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";


@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne('Country', 'departments')
  country: Country;

  @OneToMany('City', 'department')
  cities: City[];
}