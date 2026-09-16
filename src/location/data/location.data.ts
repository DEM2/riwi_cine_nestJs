import { Country } from '../dto/country.dto.js';
import { Department } from '../dto/departmet.dto.js';
import { City } from '../dto/city.dto.js';

export const COUNTRIES: Country[] = [
  {
    id: 1,
    name: 'Colombia',
  },
  {
    id: 2,
    name: 'México',
  },
  {
    id: 3,
    name: 'Argentina',
  },
];

export const DEPARTMENTS: Department[] = [
  {
    id: 1,
    name: 'Atlántico',
    countryId: 1,
  },
  {
    id: 2,
    name: 'Antioquia',
    countryId: 1,
  },
  {
    id: 3,
    name: 'Cundinamarca',
    countryId: 1,
  },
  {
    id: 4,
    name: 'Valle del Cauca',
    countryId: 1,
  },

  {
    id: 5,
    name: 'Jalisco',
    countryId: 2,
  },
  {
    id: 6,
    name: 'Nuevo León',
    countryId: 2,
  },

  {
    id: 7,
    name: 'Buenos Aires',
    countryId: 3,
  },
  {
    id: 8,
    name: 'Córdoba',
    countryId: 3,
  },
];

export const CITIES: City[] = [
  {
    id: 1,
    name: 'Barranquilla',
    departmentId: 1,
    isActive: true,
  },
  {
    id: 2,
    name: 'Soledad',
    departmentId: 1,
    isActive: true,
  },

  {
    id: 3,
    name: 'Medellín',
    departmentId: 2,
    isActive: true,
  },

  {
    id: 4,
    name: 'Bogotá',
    departmentId: 3,
    isActive: true,
  },

  {
    id: 5,
    name: 'Cali',
    departmentId: 4,
    isActive: true,
  },

  {
    id: 6,
    name: 'Guadalajara',
    departmentId: 5,
    isActive: true,
  },

  {
    id: 7,
    name: 'Monterrey',
    departmentId: 6,
    isActive: true,
  },

  {
    id: 8,
    name: 'La Plata',
    departmentId: 7,
    isActive: true,
  },

  {
    id: 9,
    name: 'Córdoba',
    departmentId: 8,
    isActive: true,
  },
];