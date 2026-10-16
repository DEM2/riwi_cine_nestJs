import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

/**
 * DTO - Parámetros de consulta del resumen de reserva
 * (`GET /reservations/summary`).
 */
export class ReservationSummaryQueryDto {
  @ApiProperty({ example: 1, description: 'Identificador del carrito' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cartId: number;

  @ApiProperty({ example: 1, description: 'Identificador de la función' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  showtimeId: number;
}
