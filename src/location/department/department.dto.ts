import { IsNotEmpty, IsString, IsBoolean, IsNumber, IsOptional, isString, isNotEmpty } from 'class-validator';

export class CreateDepartmentDto {
  
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  countryId: number;
}
