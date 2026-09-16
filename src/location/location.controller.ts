import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { LocationsService } from './location.service.js';

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

  @Get('departments/:countryId')
  getDepartmentsByCountry(
    @Param('countryId', ParseIntPipe)
    countryId: number,
  ) {
    return this.locationsService.getDepartmentsByCountry(countryId);
  }

  @Get('department/:departmentId')
  getDepartmentById(
    @Param('departmentId', ParseIntPipe)
    departmentId: number,
  ) {
    return this.locationsService.getDepartmentById(departmentId);
  }

  @Get('cities/:departmentId')
  getCitiesByDepartment(
    @Param('departmentId', ParseIntPipe)
    departmentId: number,
  ) {
    return this.locationsService.getCitiesByDepartment(departmentId);
  }

  @Get('city/:cityId')
  getCityById(
    @Param('cityId', ParseIntPipe)
    cityId: number,
  ) {
    return this.locationsService.getCityById(cityId);
  }
}
