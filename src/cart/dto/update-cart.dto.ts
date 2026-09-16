import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * Producto que se desea modificar dentro del carrito.
 */
export class UpdateCartProductDto {
  @ApiPropertyOptional({
    example: 8,
  })
  @IsInt()
  @Min(1)
  productId!: number;

  @ApiPropertyOptional({
    example: 2,
    description:
      'Nueva cantidad. El valor 0 elimina el producto del carrito.',
  })
  @IsInt()
  @Min(0)
  quantity!: number;
}

/**
 * Datos permitidos para modificar el contenido del carrito.
 */
export class UpdateCartDto {
  @ApiPropertyOptional({
    example: 15,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  showtimeId?: number;

  @ApiPropertyOptional({
    example: [25, 26],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  seatIds?: number[];

  @ApiPropertyOptional({
    type: [UpdateCartProductDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCartProductDto)
  products?: UpdateCartProductDto[];
}