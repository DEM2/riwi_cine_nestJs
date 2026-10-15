import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SeatLockDao } from '../seat/dao/seat-lock.dao.js';

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
    private readonly configService: ConfigService,
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
      const deleted = await this.seatLockDao.deleteExpired();
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
