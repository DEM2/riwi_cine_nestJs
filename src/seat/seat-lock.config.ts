import { ConfigService } from '@nestjs/config';

/**
 * Configuración de bloqueo temporal de sillas.
 *
 * Lee las variables de entorno con valores por defecto seguros:
 *  - SEAT_LOCK_TTL_MINUTES    : minutos de vigencia del bloqueo (default 10).
 *  - MAX_TICKETS_PER_SHOWTIME : máximo de entradas por carrito/función (default 5).
 */
export const DEFAULT_SEAT_LOCK_TTL_MINUTES = 10;
export const DEFAULT_MAX_TICKETS_PER_SHOWTIME = 5;

export function parsePositiveInt(
  value: string | number | undefined,
  fallback: number,
): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function getSeatLockTtlMinutes(configService: ConfigService): number {
  return parsePositiveInt(
    configService.get<string>('SEAT_LOCK_TTL_MINUTES'),
    DEFAULT_SEAT_LOCK_TTL_MINUTES,
  );
}

export function getMaxTicketsPerShowtime(configService: ConfigService): number {
  return parsePositiveInt(
    configService.get<string>('MAX_TICKETS_PER_SHOWTIME'),
    DEFAULT_MAX_TICKETS_PER_SHOWTIME,
  );
}
