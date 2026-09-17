import type { City } from "../city/city.entity.js";
import type { Country } from "../country/country.entity.js";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";


@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToOne('Country', 'departments')
  country: Country;

  @OneToMany('City', 'department')
  cities: City[];
}