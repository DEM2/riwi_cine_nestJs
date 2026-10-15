import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LocationsService } from './location.service.js';
import { CountryDao } from './country/country.dao.js';
import { DepartmentDao } from './department/department.dao.js';
import { CityDao } from './city/city.dao.js';
import { CinemaComplexDao } from './cinema-complex/cinema-complex.dao.js';

describe('LocationsService', () => {
  let service: LocationsService;
  let countryDao: {
    getCountries: ReturnType<typeof vi.fn>;
    getCountryById: ReturnType<typeof vi.fn>;
  };
  let departmentDao: { getDepartmentById: ReturnType<typeof vi.fn> };
  let cityDao: { getCityById: ReturnType<typeof vi.fn> };
  let cinemaComplexDao: { getCinemaComplexesByCity: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    countryDao = {
      getCountries: vi.fn(),
      getCountryById: vi.fn(),
    };
    departmentDao = { getDepartmentById: vi.fn() };
    cityDao = { getCityById: vi.fn() };
    cinemaComplexDao = { getCinemaComplexesByCity: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        { provide: CountryDao, useValue: countryDao },
        { provide: DepartmentDao, useValue: departmentDao },
        { provide: CityDao, useValue: cityDao },
        { provide: CinemaComplexDao, useValue: cinemaComplexDao },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDepartmentsByCountry', () => {
    it('throws NotFound when the country does not exist', async () => {
      countryDao.getCountryById.mockResolvedValue(null);

      await expect(service.getDepartmentsByCountry(1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('setUserLocation', () => {
    const buildContext = (overrides: {
      country?: unknown;
      department?: unknown;
      city?: unknown;
      complexes?: unknown[];
    }) => {
      countryDao.getCountryById.mockResolvedValue(
        overrides.country ?? { id: 1, name: 'Colombia' },
      );
      departmentDao.getDepartmentById.mockResolvedValue(
        overrides.department ?? {
          id: 2,
          name: 'Atlántico',
          country: { id: 1 },
        },
      );
      cityDao.getCityById.mockResolvedValue(
        overrides.city ?? {
          id: 3,
          name: 'Barranquilla',
          isActive: true,
          department: { id: 2 },
        },
      );
      cinemaComplexDao.getCinemaComplexesByCity.mockResolvedValue(
        overrides.complexes ?? [{ id: 1 }],
      );
    };

    it('returns the selected location when everything is valid', async () => {
      buildContext({});

      const result = await service.setUserLocation({
        countryId: 1,
        departmentId: 2,
        cityId: 3,
      });

      expect(result).toEqual({
        countryId: 1,
        departmentId: 2,
        cityId: 3,
        countryName: 'Colombia',
        departmentName: 'Atlántico',
        cityName: 'Barranquilla',
        hasActiveCinema: true,
      });
    });

    it('rejects when the department does not belong to the country', async () => {
      buildContext({ department: { id: 2, name: 'Atlántico', country: { id: 9 } } });

      await expect(
        service.setUserLocation({ countryId: 1, departmentId: 2, cityId: 3 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when the city does not belong to the department', async () => {
      buildContext({
        city: { id: 3, name: 'Barranquilla', isActive: true, department: { id: 99 } },
      });

      await expect(
        service.setUserLocation({ countryId: 1, departmentId: 2, cityId: 3 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when the city is inactive', async () => {
      buildContext({
        city: { id: 3, name: 'Barranquilla', isActive: false, department: { id: 2 } },
      });

      await expect(
        service.setUserLocation({ countryId: 1, departmentId: 2, cityId: 3 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when the city has no active cinema (RN-006)', async () => {
      buildContext({ complexes: [] });

      await expect(
        service.setUserLocation({ countryId: 1, departmentId: 2, cityId: 3 }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
