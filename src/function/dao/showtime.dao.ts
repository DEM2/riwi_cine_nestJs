import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Showtime } from '../../movie/entity/showtime.entity.js';

/**
 * DAO de funciones (Showtime). Encapsula las consultas de persistencia
 * relacionadas con las funciones de cine.
 */
@Injectable()
export class ShowtimeDao {
  constructor(
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
  ) {}

  /**
   * Obtiene una función con su película, sala y formato.
   */
  async findById(id: number): Promise<Showtime | null> {
    return this.showtimeRepository.findOne({
      where: { id },
      relations: {
        movie: true,
        room: true,
        format: true,
      },
    });
  }
}
