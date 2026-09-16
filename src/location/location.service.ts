import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Country } from './country/country.entity.js';
import { CreateCountryDto } from './country/country.dto.js';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from './department/department.entity.js';
import { CreateDepartmentDto } from './department/department.dto.js';



@Injectable()
export class LocationsService {

  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,

    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>
  ) {}
  

  getCountries(): Promise<Country[]> {
    return this.countryRepository.find();
  }
  

  async getCountryById(countryId: number): Promise<Country> {
    const country = await this.countryRepository.findOne({
      where: { id: countryId },
    });

    if (!country) {
      throw new NotFoundException(
        `País con id ${countryId} no encontrado`,
      );
    }

    return country;
  }

  async createCountry(dto: CreateCountryDto): Promise<Country> {
    let newCountryName = dto.name;
    if (typeof newCountryName !== 'string') {
      throw new BadRequestException(
        `El nombre del país debe ser una cadena de texto`,
      );
    }
    newCountryName = newCountryName.toLowerCase().trim();

    if (!newCountryName) {
      throw new BadRequestException(
        `El nombre del país no puede estar vacío`,
      );
    }

    const existingCountry = await this.countryRepository.findOneBy({name: newCountryName});
    if (existingCountry) {
      throw new BadRequestException(
        `Ya existe un país con el nombre: ${newCountryName}`,
      );
    }

    const newCountry = this.countryRepository.create({
      name: newCountryName,
    });
    return await this.countryRepository.save(newCountry);
  }

  
  getDepartments(): Promise<Department[]> {
    return this.departmentRepository.find();
  }

  async createDepartment(dto: CreateDepartmentDto): Promise<Department> {

    let newDepartmentName = dto.name;

    if (typeof newDepartmentName !== 'string') {
      throw new BadRequestException(
        `El nombre del departamento debe ser una cadena de texto`,
      );
    }
    newDepartmentName = newDepartmentName.toLowerCase().trim();

    if (!newDepartmentName) {
      throw new BadRequestException(
        `El nombre del departamento no puede estar vacío`,
      );
    }

    let countryid = dto.countryId;

    if (!countryid) {
      throw new BadRequestException(
        `El id del país no puede estar vacío`,
      );
    }

    if (typeof countryid !== 'number') {
      throw new BadRequestException(
        `El id del país debe ser un número`,
      );
    }

    await this.getCountryById(countryid);
  

    const newDepartment = this.departmentRepository.create({
      name: newDepartmentName,
      country: { id: countryid },
    });
    return await this.departmentRepository.save(newDepartment);
  }
  
  
  
  
  // getCountries(): Country[] {
  //   const c = new CountryDao();
  //   ret
  // }

  // getCountryById(countryId: number): Country {
  //   const country = COUNTRIES.find(
  //     (country) => country.id === countryId,
  //   );

  //   if (!country) {
  //     throw new NotFoundException(
  //       `País con id ${countryId} no encontrado`,
  //     );
  //   }

  //   return country;
  // }

  // getDepartmentsByCountry(
  //   countryId: number,
  // ): Department[] {

  //   const country = COUNTRIES.find(
  //     (country) => country.id === countryId,
  //   );

  //   if (!country) {
  //     throw new NotFoundException(
  //       `País con id ${countryId} no encontrado`,
  //     );
  //   }

  //   return DEPARTMENTS.filter(
  //     (department) =>
  //       department.countryId === countryId,
  //   );
  // }

  // getDepartmentById(
  //   departmentId: number,
  // ): Department {

  //   const department = DEPARTMENTS.find(
  //     (department) =>
  //       department.id === departmentId,
  //   );

  //   if (!department) {
  //     throw new NotFoundException(
  //       `Departamento con id ${departmentId} no encontrado`,
  //     );
  //   }

  //   return department;
  // }

  // getCitiesByDepartment(
  //   departmentId: number,
  // ): City[] {

  //   const department = DEPARTMENTS.find(
  //     (department) =>
  //       department.id === departmentId,
  //   );

  //   if (!department) {
  //     throw new NotFoundException(
  //       `Departamento con id ${departmentId} no encontrado`,
  //     );
  //   }

  //   return CITIES.filter(
  //     (city) =>
  //       city.departmentId === departmentId &&
  //       city.isActive,
  //   );
  // }

  // getCityById(cityId: number): City {

  //   const city = CITIES.find(
  //     (city) => city.id === cityId,
  //   );

  //   if (!city) {
  //     throw new NotFoundException(
  //       `Ciudad con id ${cityId} no encontrada`,
  //     );
  //   }

  //   return city;
  // }
}