import { IsNotEmpty, IsString, IsBoolean, IsNumber, IsOptional, isString, isNotEmpty } from 'class-validator';

export class CreateCountryDto {
  
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}