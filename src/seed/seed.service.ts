import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeatType } from '../seat/entity/seat-type.entity.js';
import { Seat } from '../seat/entity/seat.entity.js';
import { Country } from '../location/country/country.entity.js';
import { Department } from '../location/department/department.entity.js';
import { City } from '../location/city/city.entity.js';
import { CinemaComplex } from '../location/cinema-complex/cinema-complex.entity.js';
import { Room } from '../movie/entity/room.entity.js';
import { Movie } from '../movie/entity/movie.entity.js';
import { Format } from '../movie/entity/format.entity.js';
import { Showtime } from '../movie/entity/showtime.entity.js';
import { MovieFormat, MovieStatus, ShowtimeStatus } from '../movie/enum/movie.enum.js';

const ROOM_CAPACITY = 150;
const COLUMNS_PER_ROW = 10;

const SEAT_TYPES: Array<{
  code: string;
  name: string;
  extraCharge: number;
}> = [
  { code: 'STANDARD', name: 'Estándar', extraCharge: 0 },
  { code: 'PREFERENTIAL', name: 'Preferencial', extraCharge: 5000 },
  { code: 'ACCESSIBLE', name: 'Accesible (movilidad reducida)', extraCharge: 0 },
  { code: 'COMPANION', name: 'Acompañante', extraCharge: 0 },
  { code: 'VIP', name: 'VIP', extraCharge: 12000 },
];

/**
 * Servicio de datos semilla (seeders).
 *
 * Crea de forma idempotente la información mínima para probar la compra de
 * entradas: tipos de silla, un complejo con sala, las sillas de la sala y
 * funciones para los próximos 7 días.
 */
@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(SeatType)
    private readonly seatTypeRepository: Repository<SeatType>,
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(CinemaComplex)
    private readonly cinemaComplexRepository: Repository<CinemaComplex>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Format)
    private readonly formatRepository: Repository<Format>,
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
  ) {}

  async run(): Promise<void> {
    const seatTypes = await this.seedSeatTypes();
    const room = await this.seedRoom();

    await this.seedSeats(room, seatTypes);

    const movie = await this.seedMovie();
    const format = await this.seedFormat();

    await this.seedShowtimes(movie, room, format);

    this.logger.log('Datos semilla aplicados correctamente.');
  }

  private async seedSeatTypes(): Promise<Map<string, SeatType>> {
    const result = new Map<string, SeatType>();

    for (const definition of SEAT_TYPES) {
      let seatType = await this.seatTypeRepository.findOne({
        where: { code: definition.code },
      });

      if (!seatType) {
        seatType = await this.seatTypeRepository.save(
          this.seatTypeRepository.create(definition),
        );
        this.logger.log(`Tipo de silla creado: ${definition.code}`);
      }

      result.set(definition.code, seatType);
    }

    return result;
  }

  private async seedRoom(): Promise<Room> {
    const existingRoom = await this.roomRepository.findOne({
      where: {},
      order: { id: 'ASC' },
    });
    if (existingRoom) {
      return existingRoom;
    }

    const country =
      (await this.countryRepository.findOne({ where: { name: 'colombia' } })) ??
      (await this.countryRepository.save(
        this.countryRepository.create({ name: 'colombia' }),
      ));

    const department =
      (await this.departmentRepository.findOne({
        where: { name: 'atlantico' },
      })) ??
      (await this.departmentRepository.save(
        this.departmentRepository.create({ name: 'atlantico', country }),
      ));

    const city =
      (await this.cityRepository.findOne({
        where: { name: 'barranquilla' },
      })) ??
      (await this.cityRepository.save(
        this.cityRepository.create({ name: 'barranquilla', department }),
      ));

    const cinemaComplex =
      (await this.cinemaComplexRepository.findOne({
        where: { name: 'multicine demo', city: { id: city.id } },
      })) ??
      (await this.cinemaComplexRepository.save(
        this.cinemaComplexRepository.create({
          name: 'multicine demo',
          address: 'Calle 1 #2-3',
          city,
          isActive: true,
        }),
      ));

    const room = await this.roomRepository.save(
      this.roomRepository.create({
        name: 'Sala 1',
        number: 1,
        capacity: ROOM_CAPACITY,
        cinemaComplex,
        isActive: true,
      }),
    );

    this.logger.log('Complejo y sala de demostración creados.');
    return room;
  }

  private async seedSeats(
    room: Room,
    seatTypes: Map<string, SeatType>,
  ): Promise<void> {
    const existing = await this.seatRepository.count({
      where: { room: { id: room.id } },
    });
    if (existing > 0) {
      this.logger.log('Las sillas ya existen; se omite la siembra.');
      return;
    }

    const totalRows = Math.ceil(ROOM_CAPACITY / COLUMNS_PER_ROW);
    const lastRowLetter = String.fromCharCode(65 + totalRows - 1);
    const standard = seatTypes.get('STANDARD')!;
    const preferential = seatTypes.get('PREFERENTIAL')!;
    const accessible = seatTypes.get('ACCESSIBLE')!;
    const companion = seatTypes.get('COMPANION')!;
    const vip = seatTypes.get('VIP')!;

    const seats: Seat[] = [];

    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      const rowLetter = String.fromCharCode(65 + rowIndex);
      const seatsInRow =
        rowIndex === totalRows - 1
          ? ROOM_CAPACITY - rowIndex * COLUMNS_PER_ROW
          : COLUMNS_PER_ROW;

      for (let seatNumber = 1; seatNumber <= seatsInRow; seatNumber++) {
        let seatType = standard;
        let isEnabled = true;

        if (rowLetter === 'A' || rowLetter === 'B') {
          seatType = preferential;
        }

        if (rowLetter === 'A' && (seatNumber === 1 || seatNumber === COLUMNS_PER_ROW)) {
          seatType = accessible;
        }

        if (
          rowLetter === 'A' &&
          (seatNumber === 2 || seatNumber === COLUMNS_PER_ROW - 1)
        ) {
          seatType = companion;
        }

        if (rowLetter === lastRowLetter) {
          seatType = vip;
        }

        if (
          (rowLetter === 'D' && seatNumber === 4) ||
          (rowLetter === 'H' && seatNumber === 9)
        ) {
          isEnabled = false;
        }

        seats.push(
          this.seatRepository.create({
            room,
            seatType,
            rowLabel: rowLetter,
            seatNumber,
            code: `${rowLetter}-${seatNumber}`,
            isEnabled,
          }),
        );
      }
    }

    await this.seatRepository.save(seats);
    this.logger.log(`${seats.length} sillas creadas para la sala ${room.id}.`);
  }

  private async seedMovie(): Promise<Movie> {
    const existing = await this.movieRepository.findOne({
      where: {},
      order: { id: 'ASC' },
    });
    if (existing) {
      return existing;
    }

    const movie = await this.movieRepository.save(
      this.movieRepository.create({
        title: 'Película Demo',
        originalTitle: 'Demo Movie',
        synopsis: 'Película de demostración para probar la selección de sillas.',
        duration: 120,
        director: 'Riwi',
        status: MovieStatus.ACTIVE,
        isPremiere: true,
        rating: 4,
      }),
    );

    this.logger.log('Película de demostración creada.');
    return movie;
  }

  private async seedFormat(): Promise<Format> {
    const existing = await this.formatRepository.findOne({
      where: {},
      order: { id: 'ASC' },
    });
    if (existing) {
      return existing;
    }

    const format = await this.formatRepository.save(
      this.formatRepository.create({
        name: '2D',
        code: MovieFormat.TWO_D,
        description: 'Proyección estándar',
        surcharge: 0,
      }),
    );

    this.logger.log('Formato de demostración creado.');
    return format;
  }

  private async seedShowtimes(
    movie: Movie,
    room: Room,
    format: Format,
  ): Promise<void> {
    const existing = await this.showtimeRepository.count();
    if (existing > 0) {
      this.logger.log('Las funciones ya existen; se omite la siembra.');
      return;
    }

    const basePrice = 18000;
    const showtimes: Showtime[] = [];
    const today = new Date();

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);

      const schedules = [
        { hour: 10, minute: 30, durationHours: 2 },
        { hour: 14, minute: 0, durationHours: 2 },
        { hour: 18, minute: 30, durationHours: 2 },
        { hour: 21, minute: 0, durationHours: 2 },
      ];

      for (const schedule of schedules) {
        const startTime = new Date(date);
        startTime.setHours(schedule.hour, schedule.minute, 0, 0);

        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + schedule.durationHours);

        showtimes.push(
          this.showtimeRepository.create({
            movie,
            room,
            format,
            startTime,
            endTime,
            basePrice,
            finalPrice: basePrice + Number(format.surcharge ?? 0),
            totalSeats: room.capacity,
            availableSeats: room.capacity,
            status: ShowtimeStatus.ACTIVE,
          }),
        );
      }
    }

    await this.showtimeRepository.save(showtimes);
    this.logger.log(`${showtimes.length} funciones creadas.`);
  }
}
