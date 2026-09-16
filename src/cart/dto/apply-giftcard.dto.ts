import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * Datos necesarios para aplicar una Gift Card al carrito.
 */
export class ApplyGiftCardDto {
  @ApiProperty({
    example: 'GIFT-8F2K91',
    description: 'Código de la Gift Card.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code!: string;
}