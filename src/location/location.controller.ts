import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocationsService } from './location.service.js';
import { CountryResponseDto, CreateCountryDto } from './country/country.dto.js';
import { CreateDepartmentDto } from './department/department.dto.js';
import { CreateCityDto } from './city/city.dto.js';
import { SetUserLocationDto, SetUserLocationResponseDto } from './user/user.location.dto.js';

@ApiTags('Location')
@Controller()
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  // COUNTRIES

  @Get('countries')
  @ApiOperation({ summary: 'obtener países' })
  @ApiResponse({
    status: 200,
    description: 'Países obtenidos exitosamente',
    type: [CountryResponseDto],
  })
  getCountries() {
    return this.locationsService.getCountries();
  }

  @Post('countries')
  @ApiOperation({ summary: 'crear país' })
  @ApiResponse({
    status: 201,
    description: 'País creado exitosamente',
    type: CountryResponseDto,
  })
  createCountry(@Body() createCountryDto: CreateCountryDto) {
    return this.locationsService.createCountry(createCountryDto);
  }

  // DEPARTMENTS

  @Get('departments/:countryId')
  @ApiOperation({ summary: 'obtener departamentos por país' })
  @ApiParam({ name: 'countryId', type: Number })
  @ApiResponse({ status: 200, description: 'Departamentos obtenidos exitosamente' })
  @ApiResponse({ status: 404, description: 'No se encontraron departamentos' })
  getDepartmentsByCountry(
    @Param('countryId', ParseIntPipe) countryId: number,
  ) {
    return this.locationsService.getDepartmentsByCountry(countryId);
  }

  @Post('departments')
  @ApiOperation({ summary: 'crear departamento' })
  createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.locationsService.createDepartment(createDepartmentDto);
  }

  // CITIES

  @Get('cities/:departmentId')
  @ApiOperation({ summary: 'obtener ciudades por departamento' })
  @ApiParam({ name: 'departmentId', type: Number })
  @ApiResponse({ status: 200, description: 'Ciudades obtenidas exitosamente' })
  @ApiResponse({ status: 404, description: 'No se encontraron ciudades' })
  getCitiesByDepartment(
    @Param('departmentId', ParseIntPipe) departmentId: number,
  ) {
    return this.locationsService.getCitiesByDepartment(departmentId);
  }

  @Post('cities')
  @ApiOperation({ summary: 'crear ciudad' })
  createCity(@Body() createCityDto: CreateCityDto) {
    return this.locationsService.createCity(createCityDto);
  }

  @Post('users/location')
  @ApiOperation({ summary: 'seleccionar la ubicacion del usuario (país, departamento y ciudad)' })
  @ApiResponse({
    status: 200,
    description: 'Ubicación seleccionada exitosamente',
    type: SetUserLocationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No se encontraron datos' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o ciudad inactiva sin cine activo' })
  setUserLocation(@Body() setUserLocationDto: SetUserLocationDto) {
    return this.locationsService.setUserLocation(setUserLocationDto);
  }
}
