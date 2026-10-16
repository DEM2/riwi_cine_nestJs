import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { ReservationService } from './reservation.service.js';
import { SeatDao } from '../seat/dao/seat.dao.js';
import { SeatLockDao } from '../seat/dao/seat-lock.dao.js';
import { SeatLockAuditDao } from '../seat/dao/seat-lock-audit.dao.js';
import { SeatLockAuditAction } from '../seat/entity/seat-lock-audit.entity.js';
import { ShowtimeDao } from '../function/dao/showtime.dao.js';
import { ShowtimeStatus } from '../movie/enum/movie.enum.js';

describe('ReservationService', () => {
  let service: ReservationService;
  let seatDao: { findByIdsWithType: ReturnType<typeof vi.fn> };
  let seatLockDao: {
    findLockedByShowtime: ReturnType<typeof vi.fn>;
    findValidByCartAndShowtimeWithDetails: ReturnType<typeof vi.fn>;
    deleteExpired: ReturnType<typeof vi.fn>;
    lockSeats: ReturnType<typeof vi.fn>;
    releaseSeats: ReturnType<typeof vi.fn>;
  };
  let seatLockAuditDao: { record: ReturnType<typeof vi.fn> };
  let showtimeDao: { findById: ReturnType<typeof vi.fn> };
  let manager: Record<string, never>;

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

  const seat = (id: number, extraCharge = 0) => ({
    id,
    code: `A-${id}`,
    rowLabel: 'A',
    seatNumber: id,
    isEnabled: true,
    room: { id: 10 },
    seatType: { extraCharge },
  });

  beforeEach(async () => {
    seatDao = { findByIdsWithType: vi.fn() };
    seatLockDao = {
      findLockedByShowtime: vi.fn(),
      findValidByCartAndShowtimeWithDetails: vi.fn(),
      deleteExpired: vi.fn(),
      lockSeats: vi.fn(),
      releaseSeats: vi.fn(),
    };
    seatLockAuditDao = { record: vi.fn() };
    showtimeDao = { findById: vi.fn() };
    manager = {};

    const configService = {
      get: vi.fn((key: string) =>
        ({
          SEAT_LOCK_TTL_MINUTES: '10',
          MAX_TICKETS_PER_SHOWTIME: '5',
          NODE_ENV: 'test',
        })[key],
      ),
    };

    const dataSource = {
      transaction: vi.fn((callback: (m: unknown) => unknown) => callback(manager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: SeatDao, useValue: seatDao },
        { provide: SeatLockDao, useValue: seatLockDao },
        { provide: SeatLockAuditDao, useValue: seatLockAuditDao },
        { provide: ShowtimeDao, useValue: showtimeDao },
        { provide: ConfigService, useValue: configService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('lockSeats', () => {
    it('locks the requested seats and returns the total', async () => {
      showtimeDao.findById.mockResolvedValue(futureShowtime());
      seatDao.findByIdsWithType.mockResolvedValue([seat(1, 5000)]);
      seatLockDao.deleteExpired.mockResolvedValue([]);
      seatLockDao.findLockedByShowtime.mockResolvedValue([]);
      seatLockDao.lockSeats.mockResolvedValue([
        {
          seat: { id: 1 },
          cartId: 1,
          price: 25000,
          expiresAt: new Date(Date.now() + 600_000),
        },
      ]);

      const result = await service.lockSeats({
        cartId: 1,
        showtimeId: 1,
        seatIds: [1],
      });

      expect(result.total).toBe(25000);
      expect(result.seats).toHaveLength(1);
      expect(result.seats[0]).toMatchObject({ seatId: 1, cartId: 1 });
      expect(seatLockAuditDao.record).toHaveBeenCalledWith(
        SeatLockAuditAction.LOCKED,
        [{ cartId: 1, showtimeId: 1, seatId: 1 }],
        manager,
      );
    });

    it('audits the expired locks it purges before locking', async () => {
      const expired = [{ cartId: 9, showtimeId: 1, seatId: 4 }];
      showtimeDao.findById.mockResolvedValue(futureShowtime());
      seatDao.findByIdsWithType.mockResolvedValue([seat(1)]);
      seatLockDao.deleteExpired.mockResolvedValue(expired);
      seatLockDao.findLockedByShowtime.mockResolvedValue([]);
      seatLockDao.lockSeats.mockResolvedValue([
        { seat: { id: 1 }, cartId: 1, price: 20000, expiresAt: new Date() },
      ]);

      await service.lockSeats({ cartId: 1, showtimeId: 1, seatIds: [1] });

      expect(seatLockAuditDao.record).toHaveBeenCalledWith(
        SeatLockAuditAction.EXPIRED,
        expired,
        manager,
      );
    });

    it('returns 409 when another cart holds a seat', async () => {
      showtimeDao.findById.mockResolvedValue(futureShowtime());
      seatDao.findByIdsWithType.mockResolvedValue([seat(1)]);
      seatLockDao.deleteExpired.mockResolvedValue([]);
      seatLockDao.findLockedByShowtime.mockResolvedValue([
        {
          seat: { id: 1 },
          cartId: 99,
          price: 20000,
          expiresAt: new Date(Date.now() + 600_000),
        },
      ]);

      await expect(
        service.lockSeats({ cartId: 1, showtimeId: 1, seatIds: [1] }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('returns 400 when exceeding the max tickets per showtime', async () => {
      showtimeDao.findById.mockResolvedValue(futureShowtime());
      seatDao.findByIdsWithType.mockResolvedValue(
        [1, 2, 3, 4, 5, 6].map((id) => seat(id)),
      );
      seatLockDao.deleteExpired.mockResolvedValue([]);
      seatLockDao.findLockedByShowtime.mockResolvedValue([]);

      await expect(
        service.lockSeats({
          cartId: 1,
          showtimeId: 1,
          seatIds: [1, 2, 3, 4, 5, 6],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('returns 400 when a seat does not belong to the showtime room', async () => {
      showtimeDao.findById.mockResolvedValue(futureShowtime());
      seatDao.findByIdsWithType.mockResolvedValue([
        { ...seat(1), room: { id: 999 } },
      ]);

      await expect(
        service.lockSeats({ cartId: 1, showtimeId: 1, seatIds: [1] }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('releaseSeats', () => {
    it('returns the number of released seats and audits them', async () => {
      const released = [1, 2, 3].map((seatId) => ({
        cartId: 1,
        showtimeId: 1,
        seatId,
      }));
      seatLockDao.releaseSeats.mockResolvedValue(released);

      await expect(
        service.releaseSeats({ cartId: 1, showtimeId: 1, seatIds: [1, 2, 3] }),
      ).resolves.toBe(3);
      expect(seatLockAuditDao.record).toHaveBeenCalledWith(
        SeatLockAuditAction.RELEASED,
        released,
        manager,
      );
    });

    it('throws NotFound when nothing was released', async () => {
      seatLockDao.releaseSeats.mockResolvedValue([]);

      await expect(
        service.releaseSeats({ cartId: 1, showtimeId: 1, seatIds: [1] }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(seatLockAuditDao.record).not.toHaveBeenCalled();
    });
  });

  describe('getReservationSummary', () => {
    it('throws NotFound when there are no valid locks', async () => {
      seatLockDao.findValidByCartAndShowtimeWithDetails.mockResolvedValue([]);

      await expect(service.getReservationSummary(1, 1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('builds the summary from the stored locks', async () => {
      seatLockDao.findValidByCartAndShowtimeWithDetails.mockResolvedValue([
        {
          price: 25000,
          expiresAt: new Date(Date.now() + 600_000),
          showtime: {
            id: 1,
            movie: { id: 5 },
            room: { id: 10 },
            startTime: new Date(),
            endTime: new Date(),
            basePrice: 18000,
          },
          seat: {
            id: 1,
            code: 'A-1',
            rowLabel: 'A',
            seatNumber: 1,
            seatType: { name: 'Preferencial' },
          },
        },
      ]);

      const result = await service.getReservationSummary(1, 1);

      expect(result.totalSeats).toBe(1);
      expect(result.totalAmount).toBe(25000);
      expect(result.showtime.movieId).toBe(5);
      expect(result.seats[0].seatType).toBe('Preferencial');
    });
  });
});
