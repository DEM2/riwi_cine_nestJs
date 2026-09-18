import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CinemaComplex } from './cinema-complex.entity.js';
import { CinemaComplexDao } from './cinema-complex.dao.js';
import { CinemaComplexService } from './cinema-complex.service.js';
import { CinemaComplexController } from './cinema-complex.controller.js';
import { LocationsModule } from '../location.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([CinemaComplex]),
    LocationsModule,
  ],
  controllers: [CinemaComplexController],
  providers: [CinemaComplexService, CinemaComplexDao],
  exports: [CinemaComplexService],
})
export class CinemaComplexModule {}
