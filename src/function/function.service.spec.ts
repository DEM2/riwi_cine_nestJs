import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FunctionService } from './function.service.js';
import { ShowtimeDao } from './dao/showtime.dao.js';
import { SeatDao } from '../seat/dao/seat.dao.js';
import { SeatLockDao } from '../seat/dao/seat-lock.dao.js';
import { ShowtimeStatus } from '../movie/enum/movie.enum.js';

describe('FunctionService', () => {
  let service: FunctionService;
  let showtimeDao: { findById: ReturnType<typeof vi.fn> };
  let seatDao: { findByRoomWithType: ReturnType<typeof vi.fn> };
  let seatLockDao: { findLockedByShowtime: ReturnType<typeof vi.fn> };

  const futureShowtime = () => ({
    id: 1,
    startTime: new Date(Date.now() + 3_600_000),
    endTime: new Date(Date.now() + 7_200_000),
    basePrice: 18000,
    finalPrice: 20000,
    status: ShowtimeStatus.ACTIVE,
    format: { id: 1, surcharge: 0 },
    room: { id: 10 },
  });

  beforeEach(async () => {
    showtimeDao = { findById: vi.fn() };
    seatDao = { findByRoomWithType: vi.fn() };
    seatLockDao = { findLockedByShowtime: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FunctionService,
        { provide: ShowtimeDao, useValue: showtimeDao },
        { provide: SeatDao, useValue: seatDao },
        { provide: SeatLockDao, useValue: seatLockDao },
      ],
    }).compile();

    service = module.get<FunctionService>(FunctionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('throws NotFound when the showtime does not exist', async () => {
    showtimeDao.findById.mockResolvedValue(null);

    await expect(service.getShowtimeSeats(1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws BadRequest when the showtime already started', async () => {
    showtimeDao.findById.mockResolvedValue({
      ...futureShowtime(),
      startTime: new Date(Date.now() - 1000),
    });

    await expect(service.getShowtimeSeats(1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('maps seats with price and lock state', async () => {
    showtimeDao.findById.mockResolvedValue(futureShowtime());
    seatDao.findByRoomWithType.mockResolvedValue([
      {
        id: 1,
        code: 'A-1',
        rowLabel: 'A',
        seatNumber: 1,
        isEnabled: true,
        seatType: {
          id: 2,
          code: 'PREFERENTIAL',
          name: 'Preferencial',
          extraCharge: 5000,
        },
      },
      {
        id: 2,
        code: 'A-2',
        rowLabel: 'A',
        seatNumber: 2,
        isEnabled: true,
        seatType: {
          id: 1,
          code: 'STANDARD',
          name: 'Estándar',
          extraCharge: 0,
        },
      },
    ]);
    seatLockDao.findLockedByShowtime.mockResolvedValue([
      { seat: { id: 1 }, cartId: 7 },
    ]);

    const result = await service.getShowtimeSeats(1);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 1,
      status: 'locked',
      lockedByCartId: 7,
      price: 25000,
    });
    expect(result[1]).toMatchObject({
      id: 2,
      status: 'available',
      lockedByCartId: null,
      price: 20000,
    });
  });

  it('includes disabled seats with status disabled', async () => {
    showtimeDao.findById.mockResolvedValue(futureShowtime());
    seatDao.findByRoomWithType.mockResolvedValue([
      {
        id: 3,
        code: 'A-3',
        rowLabel: 'A',
        seatNumber: 3,
        isEnabled: false,
        seatType: { id: 1, code: 'STANDARD', name: 'Estándar', extraCharge: 0 },
      },
    ]);
    seatLockDao.findLockedByShowtime.mockResolvedValue([]);

    const result = await service.getShowtimeSeats(1);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 3,
      status: 'disabled',
      lockedByCartId: null,
    });
  });
});
