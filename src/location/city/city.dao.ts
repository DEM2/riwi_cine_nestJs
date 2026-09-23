import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { City } from './city.entity.js';

import { CreateCityDto } from './city.dto.js';

@Injectable()
export class CityDao {
  constructor(private readonly dataSource: DataSource) {}

  public getCities(): Repository<City> {
    return this.dataSource.getRepository(City);
  }
  async findAllWithDepartment(): Promise<City[]> {
    const cityRepository = this.getCities();
    return await cityRepository.find({
      relations: { department: true },
    });
  }
  async getCityById(id: number): Promise<City | null> {
    const cityRepository = this.getCities();
    return await cityRepository.findOne({
      where: { id },
      relations: { department: true },
    });
  }
  async findCityByName(name: string): Promise<City | null> {
    const cityRepository = this.getCities();
    return await cityRepository.findOne({
      where: { name },
    });
  }
  async getCitiesByDepartment(departmentId: number): Promise<City[]> {
    const cityRepository = this.getCities();
    return await cityRepository.find({
      where: { department: { id: departmentId }, isActive: true },
    });
  }

  async createCity(dto: CreateCityDto): Promise<City> {
    const cityRepository = this.getCities();
    const city = cityRepository.create({
      name: dto.name,
      department: { id: dto.departmentId },
    });
    return await cityRepository.save(city);
  }
}
