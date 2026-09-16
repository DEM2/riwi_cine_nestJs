import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Department } from "./department.entity.js";

import { CreateDepartmentDto } from "./department.dto.js";

@Injectable()
export class DepartmentDao{
    constructor(private readonly dataSource: DataSource){}

    public getDepartments(): Repository<Department>{
        return this.dataSource.getRepository(Department);
    }
    async getDepartmentById(id: number): Promise<Department | null>{
        const departmentRepository = this.getDepartments();
        return await departmentRepository.findOne({
            where: { id },
        });
    }
    async createDepartment(dto: CreateDepartmentDto): Promise<Department>{
        const departmentRepository = this.getDepartments();
        const department = departmentRepository.create({
            name: dto.name,
            country: { id: dto.countryId },
        });
        return await departmentRepository.save(department);
    }
}

