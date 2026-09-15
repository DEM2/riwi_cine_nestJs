import { IsNotEmpty, IsString } from "class-validator";
export interface Country {
  id: number;
  name: string;
}

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export interface Department {
  id: number;
  name: string;
  countryId: number;
}

export interface City {
  id: number;
  name: string;
  departmentId: number;
  isActive: boolean;
}