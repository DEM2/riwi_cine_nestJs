import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { SeatLockDao } from '../seat/dao/seat-lock.dao.js';
import { SeatLockAuditDao } from '../seat/dao/seat-lock-audit.dao.js';
import { SeatLockAuditAction } from '../seat/entity/seat-lock-audit.entity.js';

const PURGE_INTERVAL_MS = 60_000;

/**
 * Purga periódica de bloqueos expirados (RN-040).
 *
 * Cada minuto elimina físicamente las sillas bloqueadas cuya vigencia expiró,
 * de modo que vuelvan al estado Disponible aunque nadie consulte el mapa.
 *
 * La corrección no depende de este job: toda lectura y bloqueo filtra por
 * vigencia (expiración perezosa); este temporizador es limpieza periódica.
 */
@Injectable()
export class SeatLockPurgerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SeatLockPurgerService.name);
  private intervalRef?: NodeJS.Timeout;

  constructor(
    private readonly seatLockDao: SeatLockDao,
    private readonly seatLockAuditDao: SeatLockAuditDao,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit(): void {
    if (this.configService.get<string>('NODE_ENV') === 'test') {
      return;
    }

    this.intervalRef = setInterval(() => {
      void this.purge();
    }, PURGE_INTERVAL_MS);

    this.logger.log('Purga de bloqueos expirados iniciada (cada minuto).');
  }

  onModuleDestroy(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = undefined;
    }
  }

  private async purge(): Promise<void> {
    try {
      const deleted = await this.dataSource.transaction(async (manager) => {
        const expired = await this.seatLockDao.deleteExpired(manager);
        await this.seatLockAuditDao.record(
          SeatLockAuditAction.EXPIRED,
          expired,
          manager,
        );
        return expired.length;
      });
      if (deleted > 0) {
        this.logger.log(
          `${deleted} bloqueo(s) expirado(s) eliminado(s).`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Error purgando bloqueos expirados.',
        error as Error,
      );
    }
  }
}
