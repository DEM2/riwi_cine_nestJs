import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCountryDto {

  @ApiProperty({ example: 'Colombia' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CountryResponseDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'Colombia' })
  @IsString()
  name: string;
}