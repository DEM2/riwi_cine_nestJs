import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCityDto {
  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ example: 'Barranquilla' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  departmentId: number;
}
