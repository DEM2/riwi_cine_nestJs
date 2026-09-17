import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocationsService } from './location.service.js';
import { CreateCountryDto } from './country/country.dto.js';
import { CreateDepartmentDto } from './department/department.dto.js';
import { CreateCityDto } from './city/city.dto.js';

@ApiTags('Location')
@Controller()
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  // COUNTRIES
  @ApiOperation({ summary: 'obtener países' })
  @Get('countries')
  getCountries() {
    return this.locationsService.getCountries();
  }

  @ApiOperation({ summary: 'obtener país por Id' })
  @Get('countries/:countryId')
  getCountryById(
    @Param('countryId', ParseIntPipe)
    countryId: number,
  ) {
    return this.locationsService.getCountryById(countryId);
  }
  @ApiOperation({ summary: 'crear país' })
  @Post('countries')
  createCountry(@Body() createCountryDto: CreateCountryDto) {
    return this.locationsService.createCountry(createCountryDto);
  }

  /// DEPARTMENTS
  @ApiOperation({ summary: 'obtener departamentos' })
  @Get('departments')
  getDepartments() {
    return this.locationsService.getDepartments();
  }
  @ApiOperation({ summary: 'obtener departamento por Id' })
  @Get('departments/:departmentId')
  getDepartmentById(
    @Param('departmentId', ParseIntPipe)
    departmentId: number,
  ) {
    return this.locationsService.getDepartmentById(departmentId);
  }

  @ApiOperation({ summary: 'crear departamento' })
  @Post('departments')
  createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.locationsService.createDepartment(createDepartmentDto);
  }

  // CITIES

  @ApiOperation({ summary: 'obtener ciudades' })
  @Get('cities')
  getCities() {
    return this.locationsService.getCities();
  }

  @ApiOperation({ summary: 'obtener ciudade por Id' })
  @Get('cities/:cityId')
  getCityById(
    @Param('cityId', ParseIntPipe)
    cityId: number,
  ) {
    return this.locationsService.getCityById(cityId);
  }

  @ApiOperation({ summary: 'crear ciudad' })
  @Post('cities')
  createCity(@Body() createCityDto: CreateCityDto) {
    return this.locationsService.createCity(createCityDto);
  }
}
