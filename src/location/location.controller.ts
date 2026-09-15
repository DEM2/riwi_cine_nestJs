import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { LocationsService } from './location.service.js';
import { CreateCountryDto } from './location.dto.js';

@Controller()
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('countries')
  getCountries() {
    return this.locationsService.getCountries();
  }

  @Get('countries/:countryId')
  getCountryById(
    @Param('countryId', ParseIntPipe)
    countryId: number,
  ) {
    return this.locationsService.getCountryById(countryId);
  }

  @Post('countries')
  createCountry(@Body() createCountryDto: CreateCountryDto) { 
    return this.locationsService.createCountry(createCountryDto);
  }

  // @Get('departments/:countryId')
  // getDepartmentsByCountry(
  //   @Param('countryId', ParseIntPipe)
  //   countryId: number,
  // ) {
  //   return this.locationsService.getDepartmentsByCountry(countryId);
  // }

  // @Get('department/:departmentId')
  // getDepartmentById(
  //   @Param('departmentId', ParseIntPipe)
  //   departmentId: number,
  // ) {
  //   return this.locationsService.getDepartmentById(departmentId);
  // }

  // @Get('cities/:departmentId')
  // getCitiesByDepartment(
  //   @Param('departmentId', ParseIntPipe)
  //   departmentId: number,
  // ) {
  //   return this.locationsService.getCitiesByDepartment(departmentId);
  // }

  // @Get('city/:cityId')
  // getCityById(
  //   @Param('cityId', ParseIntPipe)
  //   cityId: number,
  // ) {
  //   return this.locationsService.getCityById(cityId);
  // }
}
