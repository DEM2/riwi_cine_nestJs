import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CinemaComplexService } from './cinema-complex.service.js';
import { CreateCinemaComplexDto } from './cinema-complex.dto.js';

@ApiTags('Cinema Complex')
@Controller('cinema-complex')
export class CinemaComplexController {
  constructor(private readonly cinemaComplexService: CinemaComplexService) {}

  @ApiOperation({ summary: 'obtener complejos de cine' })
  @Get()
  getCinemaComplexes() {
    return this.cinemaComplexService.getCinemaComplexes();
  }

  @ApiOperation({ summary: 'obtener complejo de cine por Id' })
  @Get(':id')
  getCinemaComplexById(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.cinemaComplexService.getCinemaComplexById(id);
  }

  @ApiOperation({ summary: 'obtener complejos de cine por ciudad' })
  @Get('city/:cityId')
  getCinemaComplexesByCity(
    @Param('cityId', ParseIntPipe)
    cityId: number,
  ) {
    return this.cinemaComplexService.getCinemaComplexesByCity(cityId);
  }

  @ApiOperation({ summary: 'crear complejo de cine' })
  @Post()
  createCinemaComplex(@Body() createCinemaComplexDto: CreateCinemaComplexDto) {
    return this.cinemaComplexService.createCinemaComplex(createCinemaComplexDto);
  }
}
