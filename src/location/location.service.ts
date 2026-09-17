import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Country } from './country/country.entity.js';
import { CreateCountryDto } from './country/country.dto.js';
import { CountryDao } from './country/country.dao.js';
import { Department } from './department/department.entity.js';
import { CreateDepartmentDto } from './department/department.dto.js';
import { DepartmentDao } from './department/department.dao.js';
import { CreateCityDto } from './city/city.dto.js';
import { City } from './city/city.entity.js';
import { CityDao } from './city/city.dao.js';

@Injectable()
export class LocationsService {

  constructor(
    private readonly countryDao: CountryDao,
    private readonly departmentDao: DepartmentDao,
    private readonly cityDao: CityDao,
  ) {}

  /// COUNTRY 

  async getCountries(): Promise<Country[]> {
    const countries = await this.countryDao.getCountries().find();
    if (countries.length === 0) {
      throw new NotFoundException('No se encontraron países');
    }
    return countries;
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

    const existingCountry = await this.countryDao.findCountryByName(newCountryName);
    if (existingCountry) {
      throw new ConflictException(
        `Ya existe un país con el nombre: ${newCountryName}`,
      );
    }

    return await this.countryDao.createCountry({ name: newCountryName });
  }

  /// DEPARTMENT

  async getDepartments(): Promise<Department[]> {
    const departments = await this.departmentDao.getDepartments().find();
    if (departments.length === 0) {
      throw new NotFoundException('No se encontraron departamentos');
    }
    return departments;
  }

  async getDepartmentById(departmentId: number): Promise<Department> {
    const department = await this.departmentDao.getDepartmentById(departmentId);
    if (!department) {
      throw new NotFoundException(
        `Departamento con id ${departmentId} no encontrado`,
      );
    }
    return department;
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

    const existingDepartment = await this.departmentDao.findDepartmentByName(newDepartmentName);
    if (existingDepartment) {
      throw new ConflictException(
        `Ya existe un departamento con el nombre: ${newDepartmentName}`,
      );
    }

    return await this.departmentDao.createDepartment({
      name: newDepartmentName,
      countryId: countryid,
    });
  }

  /// CITY

  async getCities(): Promise<City[]> {
    const cities = await this.cityDao.getCities().find();
    if (cities.length === 0) {
      throw new NotFoundException('No se encontraron ciudades');
    }
    return cities;
  }

  async getCityById(cityId: number): Promise<City> {
    const city = await this.cityDao.getCityById(cityId);
    if (!city) {
      throw new NotFoundException(
        `Ciudad con id ${cityId} no encontrada`,
      );
    }
    return city;
  } 

  async createCity(dto: CreateCityDto): Promise<City> {
    let newCityName = dto.name;
    if (typeof newCityName !== 'string') {
      throw new BadRequestException(
        `El nombre de la ciudad debe ser una cadena de texto`,
      );
    }
    newCityName = newCityName.toLowerCase().trim();

    if (!newCityName) {
      throw new BadRequestException(
        `El nombre de la ciudad no puede estar vacío`,
      );
    }

    let departmentid = dto.departmentId;
    if (!departmentid) {
      throw new BadRequestException(
        `El id del departamento no puede estar vacío`,
      );
    }
    if (typeof departmentid !== 'number') {
      throw new BadRequestException(
        `El id del departamento debe ser un número`,
      );
    }

    await this.getDepartmentById(departmentid);

    const existingCity = await this.cityDao.findCityByName(newCityName);
    if (existingCity) {
      throw new ConflictException(
        `Ya existe una ciudad con el nombre: ${newCityName}`,
      );
    }

    return await this.cityDao.createCity({
      name: newCityName,
      departmentId: departmentid,
    });
  }

  
}
