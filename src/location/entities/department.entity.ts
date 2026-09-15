import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { Country } from "./country.entity.js";
import { City } from "./city.entity.js";


@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Country, (country) => country.departments)
  country: Country;

  @OneToMany(() => City, (city) => city.department)
  cities: City[];
}