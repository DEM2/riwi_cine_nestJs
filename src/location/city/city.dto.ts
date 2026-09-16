import { IsNotEmpty, IsString, IsBoolean, IsNumber, IsOptional, isString, isNotEmpty } from 'class-validator';

export class CreateCityDto {
  
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  departmentId: number;
}
