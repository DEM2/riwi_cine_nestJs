import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CinemaComplex } from './cinema-complex.entity.js';
import { CreateCinemaComplexDto } from './cinema-complex.dto.js';

@Injectable()
export class CinemaComplexDao {
  constructor(private readonly dataSource: DataSource) {}

  public getCinemaComplexes(): Repository<CinemaComplex> {
    return this.dataSource.getRepository(CinemaComplex);
  }

  async findAllWithCity(): Promise<CinemaComplex[]> {
    const cinemaComplexRepository = this.getCinemaComplexes();
    return await cinemaComplexRepository.find({
      relations: { city: true },
    });
  }

  async getCinemaComplexById(id: number): Promise<CinemaComplex | null> {
    const cinemaComplexRepository = this.getCinemaComplexes();
    return await cinemaComplexRepository.findOne({
      where: { id },
      relations: { city: true },
    });
  }

  async findCinemaComplexByNameAndCity(
    name: string,
    cityId: number,
  ): Promise<CinemaComplex | null> {
    const cinemaComplexRepository = this.getCinemaComplexes();
    return await cinemaComplexRepository.findOne({
      where: { name, city: { id: cityId } },
    });
  }

  async findCinemaComplexByAddressAndCity(
    address: string,
    cityId: number,
  ): Promise<CinemaComplex | null> {
    const cinemaComplexRepository = this.getCinemaComplexes();
    return await cinemaComplexRepository.findOne({
      where: { address, city: { id: cityId } },
    });
  }

  async getCinemaComplexesByCity(cityId: number): Promise<CinemaComplex[]> {
    const cinemaComplexRepository = this.getCinemaComplexes();
    return await cinemaComplexRepository.find({
      where: { city: { id: cityId }, isActive: true },
    });
  }

  async createCinemaComplex(
    dto: CreateCinemaComplexDto,
  ): Promise<CinemaComplex> {
    const cinemaComplexRepository = this.getCinemaComplexes();
    const cinemaComplex = cinemaComplexRepository.create({
      name: dto.name,
      address: dto.address,
      isActive: dto.isActive,
      city: { id: dto.cityId },
    });
    return await cinemaComplexRepository.save(cinemaComplex);
  }
}
