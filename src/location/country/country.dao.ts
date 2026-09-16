import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Country } from "./country.entity.js";

import { CreateCountryDto } from "./country.dto.js";

@Injectable()
export class CountryDao{
    constructor(private readonly dataSource: DataSource){}

    public getCountries(): Repository<Country>{
        return this.dataSource.getRepository(Country);
    }
    async getCountryById(id: number): Promise<Country | null>{
        const countryRepository = this.getCountries();
        return await countryRepository.findOne({
            where: { id },
        });
    }
    async createCountry(createCountryDto: CreateCountryDto): Promise<Country>{
        const countryRepository = this.getCountries();
        const country = countryRepository.create(createCountryDto);
        return await countryRepository.save(country);
    }
}

