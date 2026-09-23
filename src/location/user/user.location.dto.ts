import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetUserLocationDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  countryId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  departmentId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  cityId: number;
}

export class SetUserLocationResponseDto {
  @ApiProperty({ example: 1 })
  countryId: number;

  @ApiProperty({ example: 1 })
  departmentId: number;

  @ApiProperty({ example: 1 })
  cityId: number;

  @ApiProperty({ example: 'Colombia' })
  countryName: string;

  @ApiProperty({ example: 'Atlántico' })
  departmentName: string;

  @ApiProperty({ example: 'Barranquilla' })
  cityName: string;

  @ApiProperty({ example: true })
  hasActiveCinema: boolean;
}
