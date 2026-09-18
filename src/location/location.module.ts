import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsController } from './location.controller.js';
import { LocationsService } from './location.service.js';
import { CountryDao } from './country/country.dao.js';
import { DepartmentDao } from './department/department.dao.js';
import { Country } from './country/country.entity.js';
import { Department } from './department/department.entity.js';
import { City } from './city/city.entity.js';
import { CityDao } from './city/city.dao.js';
import { CinemaComplex } from './cinema-complex/cinema-complex.entity.js';
import { CinemaComplexDao } from './cinema-complex/cinema-complex.dao.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Country, Department, City, CinemaComplex]), 
  ],
  controllers: [
    LocationsController,
  ],

  providers: [
    LocationsService,
    CountryDao,
    DepartmentDao,
    CityDao,
    CinemaComplexDao,
  ],

  exports: [
    LocationsService,
  ],
})
export class LocationsModule {}