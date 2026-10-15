import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Showtime } from '../movie/entity/showtime.entity.js';
import { ShowtimeStatus } from '../movie/enum/movie.enum.js';

/**
 * Valida que una función exista y sea seleccionable para ver/ bloquear sillas.
 *
 * Reglas (paridad con Express `getPrice`):
 *  - 404 si la función no existe.
 *  - 404 si la función no está activa.
 *  - 400 si la función ya inició.
 *  - 400 si no tiene formato o sala configurados.
 */
export function assertShowtimeSelectable(
  showtime: Showtime | null,
): asserts showtime is Showtime {
  if (!showtime) {
    throw new NotFoundException('Función no encontrada.');
  }

  if (showtime.status !== ShowtimeStatus.ACTIVE) {
    throw new NotFoundException('La función no está disponible.');
  }

  if (new Date(showtime.startTime).getTime() <= Date.now()) {
    throw new BadRequestException(
      'No se puede seleccionar una función que ya inició.',
    );
  }

  if (!showtime.format || !showtime.room) {
    throw new BadRequestException(
      'La función no tiene formato o sala configurados.',
    );
  }
}

/**
 * Calcula el precio final de una función.
 *
 * En Nest el `finalPrice` ya viene almacenado; si no está definido se calcula
 * a partir de `basePrice + format.surcharge`. La sala no aporta recargo en
 * este modelo.
 */
export function resolveFinalPrice(showtime: Showtime): number {
  const stored = Number(showtime.finalPrice);
  if (Number.isFinite(stored) && stored > 0) {
    return stored;
  }

  const basePrice = Number(showtime.basePrice) || 0;
  const surcharge = Number(showtime.format?.surcharge ?? 0) || 0;
  return basePrice + surcharge;
}
