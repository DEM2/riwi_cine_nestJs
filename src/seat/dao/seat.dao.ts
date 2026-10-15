import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Seat } from '../entity/seat.entity.js';

/**
 * DAO de sillas (Seat). Encapsula las consultas de persistencia de sillas.
 */
@Injectable()
export class SeatDao {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
  ) {}

  /**
   * Obtiene las sillas habilitadas de una sala junto con su tipo.
   */
  async findEnabledByRoomWithType(roomId: number): Promise<Seat[]> {
    return this.seatRepository.find({
      where: { room: { id: roomId }, isEnabled: true },
      relations: { seatType: true },
      order: { rowLabel: 'ASC', seatNumber: 'ASC' },
    });
  }

  /**
   * Obtiene las sillas indicadas junto con su tipo.
   */
  async findByIdsWithType(seatIds: number[]): Promise<Seat[]> {
    if (seatIds.length === 0) {
      return [];
    }
    return this.seatRepository.find({
      where: { id: In(seatIds) },
      relations: { seatType: true, room: true },
    });
  }
}
