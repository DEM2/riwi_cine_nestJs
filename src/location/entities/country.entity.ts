import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@entity('countries')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Department, (department) => department.country)
  departments: Department[];
}