import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  COUNTRIES,
  DEPARTMENTS,
  CITIES,
} from './data/location.data.js';

import { Country } from './dto/country.dto.js';
import { Department } from './dto/departmet.dto.js';
import { City } from './dto/city.dto.js';

@Injectable()
export class LocationsService {

  getCountries(): Country[] {
    return COUNTRIES;
  }

  getCountryById(countryId: number): Country {
    const country = COUNTRIES.find(
      (country) => country.id === countryId,
    );

    if (!country) {
      throw new NotFoundException(
        `País con id ${countryId} no encontrado`,
      );
    }

    return country;
  }

  getDepartmentsByCountry(
    countryId: number,
  ): Department[] {

    const country = COUNTRIES.find(
      (country) => country.id === countryId,
    );

    if (!country) {
      throw new NotFoundException(
        `País con id ${countryId} no encontrado`,
      );
    }

    return DEPARTMENTS.filter(
      (department) =>
        department.countryId === countryId,
    );
  }

  getDepartmentById(
    departmentId: number,
  ): Department {

    const department = DEPARTMENTS.find(
      (department) =>
        department.id === departmentId,
    );

    if (!department) {
      throw new NotFoundException(
        `Departamento con id ${departmentId} no encontrado`,
      );
    }

    return department;
  }

  getCitiesByDepartment(
    departmentId: number,
  ): City[] {

    const department = DEPARTMENTS.find(
      (department) =>
        department.id === departmentId,
    );

    if (!department) {
      throw new NotFoundException(
        `Departamento con id ${departmentId} no encontrado`,
      );
    }

    return CITIES.filter(
      (city) =>
        city.departmentId === departmentId &&
        city.isActive,
    );
  }

  getCityById(cityId: number): City {

    const city = CITIES.find(
      (city) => city.id === cityId,
    );

    if (!city) {
      throw new NotFoundException(
        `Ciudad con id ${cityId} no encontrada`,
      );
    }

    return city;
  }
}