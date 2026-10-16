import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  SeatLockAudit,
  SeatLockAuditAction,
} from '../entity/seat-lock-audit.entity.js';

/**
 * Silla afectada por un bloqueo, liberación o expiración.
 */
export interface SeatLockRef {
  cartId: number;
  showtimeId: number;
  seatId: number;
}

/**
 * DAO de auditoría de bloqueos de sillas (SeatLockAudit).
 */
@Injectable()
export class SeatLockAuditDao {
  constructor(
    @InjectRepository(SeatLockAudit)
    private readonly seatLockAuditRepository: Repository<SeatLockAudit>,
  ) {}

  /**
   * Registra una acción sobre las sillas indicadas. Si se recibe `manager`,
   * el registro forma parte de la misma transacción que la operación.
   */
  async record(
    action: SeatLockAuditAction,
    refs: SeatLockRef[],
    manager?: EntityManager,
  ): Promise<void> {
    if (refs.length === 0) {
      return;
    }

    const repository = manager
      ? manager.getRepository(SeatLockAudit)
      : this.seatLockAuditRepository;

    await repository.insert(refs.map((ref) => ({ action, ...ref })));
  }
}
