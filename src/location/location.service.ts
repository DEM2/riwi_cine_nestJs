import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Country } from './entities/country.entity.js';
import {CountryDao} from './location.dao.js';
import { CreateCountryDto } from './location.dto.js';

@Injectable()
export class LocationsService {

  constructor(private readonly countryDao: CountryDao) {}

  getCountries(): Promise<Country[]> {
    return this.countryDao.getCountries().find();
  }

  async getCountryById(countryId: number): Promise<Country> {
    const country = await this.countryDao.getCountryById(countryId);

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

    return await this.countryDao.createCountry({
      name: newCountryName,
    } as CreateCountryDto);
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