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
  async getCityById(id: number): Promise<City | null> {
    const cityRepository = this.getCities();
    return await cityRepository.findOne({
      where: { id },
    });
  }
  async findCityByName(name: string): Promise<City | null> {
    const cityRepository = this.getCities();
    return await cityRepository.findOne({
      where: { name },
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
