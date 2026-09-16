import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsController } from './location.controller.js';
import { LocationsService } from './location.service.js';
import { CountryDao } from './location.dao.js';
import { Country } from './entities/country.entity.js';
import { City } from './entities/city.entity.js';
import { Department } from './entities/department.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Country, Department, City]), 
  ],
  controllers: [
    LocationsController,
  ],

  providers: [
    LocationsService,
    CountryDao
  ],

  exports: [
    LocationsService,
  ],
})
export class LocationsModule {}