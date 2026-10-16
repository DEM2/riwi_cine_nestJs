import { ApiProperty } from '@nestjs/swagger';

/**
 * Bloqueo devuelto por `POST /reservations/lock-seats`.
 */
export class LockedSeatResponseDto {
  @ApiProperty()
  seatId: number;

  @ApiProperty()
  cartId: number;

  @ApiProperty()
  showtimeId: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  expiresAt: Date;
}

export class LockSeatsResponseDto {
  @ApiProperty({ type: [LockedSeatResponseDto] })
  seats: LockedSeatResponseDto[];

  @ApiProperty()
  total: number;
}

/**
 * Silla del resumen (`GET /reservations/summary`).
 */
export class SummarySeatResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  rowLabel: string;

  @ApiProperty()
  seatNumber: number;

  @ApiProperty()
  seatType: string;

  @ApiProperty()
  price: number;
}

export class SummaryShowtimeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ nullable: true })
  movieId: number | null;

  @ApiProperty({ nullable: true })
  roomId: number | null;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  basePrice: number;
}

export class ReservationSummaryResponseDto {
  @ApiProperty()
  cartId: number;

  @ApiProperty({ type: SummaryShowtimeResponseDto })
  showtime: SummaryShowtimeResponseDto;

  @ApiProperty({ type: [SummarySeatResponseDto] })
  seats: SummarySeatResponseDto[];

  @ApiProperty()
  totalSeats: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty({ nullable: true })
  expiresAt: Date | null;
}
