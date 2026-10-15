import { ApiProperty } from '@nestjs/swagger';

/**
 * Tipo de silla embebido en la respuesta del mapa de sillas.
 */
export class SeatTypeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;
}

/**
 * Silla del mapa de una función (`GET /functions/:id/seats`).
 */
export class ShowtimeSeatResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  rowLabel: string;

  @ApiProperty()
  seatNumber: number;

  @ApiProperty({ type: SeatTypeResponseDto, nullable: true })
  seatType: SeatTypeResponseDto | null;

  @ApiProperty({ enum: ['available', 'locked'] })
  status: 'available' | 'locked';

  @ApiProperty({
    nullable: true,
    description:
      'Carrito que mantiene el bloqueo. `null` si la silla está disponible.',
  })
  lockedByCartId: number | null;

  @ApiProperty()
  price: number;
}
