import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  Min,
} from 'class-validator';

/**
 * DTO - Bloqueo de sillas (`POST /reservations/lock-seats`).
 */
export class LockSeatsDto {
  @ApiProperty({ example: 1, description: 'Identificador del carrito' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  cartId: number;

  @ApiProperty({ example: 1, description: 'Identificador de la función' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  showtimeId: number;

  @ApiProperty({ example: [1, 2, 3], description: 'Sillas a bloquear' })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  seatIds: number[];
}
