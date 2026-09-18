import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CinemaComplex } from './cinema-complex.entity.js';
import { CreateCinemaComplexDto } from './cinema-complex.dto.js';
import { CinemaComplexDao } from './cinema-complex.dao.js';
import { LocationsService } from '../location.service.js';

@Injectable()
export class CinemaComplexService {
  constructor(
    private readonly cinemaComplexDao: CinemaComplexDao,
    private readonly locationsService: LocationsService,
  ) {}

  async getCinemaComplexes(): Promise<CinemaComplex[]> {
    const complexes = await this.cinemaComplexDao.findAllWithCity();
    if (complexes.length === 0) {
      throw new NotFoundException('No se encontraron complejos de cine');
    }
    return complexes;
  }

  async getCinemaComplexById(id: number): Promise<CinemaComplex> {
    const complex = await this.cinemaComplexDao.getCinemaComplexById(id);
    if (!complex) {
      throw new NotFoundException(
        `Complejo de cine con id ${id} no encontrado`,
      );
    }
    return complex;
  }

  async getCinemaComplexesByCity(cityId: number): Promise<CinemaComplex[]> {
    await this.locationsService.getCityById(cityId);
    const complexes = await this.cinemaComplexDao.getCinemaComplexesByCity(cityId);
    if (complexes.length === 0) {
      throw new NotFoundException(
        `No se encontraron complejos de cine para la ciudad con id ${cityId}`,
      );
    }
    return complexes;
  }

  async createCinemaComplex(dto: CreateCinemaComplexDto): Promise<CinemaComplex> {
    let newName = dto.name;
    if (typeof newName !== 'string') {
      throw new BadRequestException(
        'El nombre del complejo debe ser una cadena de texto',
      );
    }
    newName = newName.toLowerCase().trim();

    if (!newName) {
      throw new BadRequestException(
        'El nombre del complejo no puede estar vacío',
      );
    }

    const newAddress = dto.address;
    if (!newAddress) {
      throw new BadRequestException(
        'La dirección del complejo no puede estar vacía',
      );
    }

    let cityid = dto.cityId;
    if (!cityid) {
      throw new BadRequestException(
        'El id de la ciudad no puede estar vacío',
      );
    }
    if (typeof cityid !== 'number') {
      throw new BadRequestException(
        'El id de la ciudad debe ser un número',
      );
    }

    await this.locationsService.getCityById(cityid);

    const existingByName = await this.cinemaComplexDao.findCinemaComplexByNameAndCity(
      newName,
      cityid,
    );
    if (existingByName) {
      throw new ConflictException(
        `Ya existe un complejo de cine con el nombre: '${newName}' en la ciudad`,
      );
    }

    const existingByAddress = await this.cinemaComplexDao.findCinemaComplexByAddressAndCity(
      newAddress,
      cityid,
    );
    if (existingByAddress) {
      throw new ConflictException(
        `Ya existe un complejo de cine con la dirección: '${newAddress}' en la ciudad`,
      );
    }

    return await this.cinemaComplexDao.createCinemaComplex({
      name: newName,
      address: newAddress,
      isActive: dto.isActive,
      cityId: cityid,
    });
  }
}
