import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LocationsService } from './location.service.js';
import { CreateCountryDto } from './country/country.dto.js';
import { CreateDepartmentDto } from './department/department.dto.js';
import { CreateCityDto } from './city/city.dto.js';

@ApiTags('Location')
@Controller()
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  // COUNTRIES

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

  /// DEPARTMENTS

  @Get('departments')
  getDepartments() {
    return this.locationsService.getDepartments();
  }

  @Get('departments/:departmentId')
  getDepartmentById(
    @Param('departmentId', ParseIntPipe)
    departmentId: number,
  ) {
    return this.locationsService.getDepartmentById(departmentId);
  }

  @Post('departments')
  createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.locationsService.createDepartment(createDepartmentDto);
  }

  // CITIES

  @Get('cities')
  getCities() {
    return this.locationsService.getCities();
  }

  @Get('cities/:cityId')
  getCityById(
    @Param('cityId', ParseIntPipe)
    cityId: number,
  ) {
    return this.locationsService.getCityById(cityId);
  }

  @Post('cities')
  createCity(@Body() createCityDto: CreateCityDto) {
    return this.locationsService.createCity(createCityDto);
  }
}
