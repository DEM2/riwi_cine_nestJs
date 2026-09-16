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

@Module({
  imports: [
    TypeOrmModule.forFeature([Country, Department, City]), 
  ],
  controllers: [
    LocationsController,
  ],

  providers: [
    LocationsService,
    CountryDao,
    DepartmentDao,
    CityDao,
  ],

  exports: [
    LocationsService,
  ],
})
export class LocationsModule {}