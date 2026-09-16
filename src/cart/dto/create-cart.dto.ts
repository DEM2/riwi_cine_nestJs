import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsPositive,
} from 'class-validator';

/**
 * Datos necesarios para crear un carrito después de seleccionar
 * una función y sus respectivas sillas.
 */
export class CreateCartDto {
  @ApiProperty({
    example: 15,
    description: 'Identificador de la función seleccionada.',
  })
  @IsInt()
  @IsPositive()
  showtimeId!: number;

  @ApiProperty({
    example: [21, 22, 23],
    description: 'Identificadores de las sillas seleccionadas.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  seatIds!: number[];
}