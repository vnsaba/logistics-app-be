import { prismaMysql } from "../../../../prisma/index";
import { Department } from "../../domain/entity/department";

export class DepartmentRepository {
  async findByName(name: string): Promise<Department | null> {
    return await prismaMysql.department.findFirst({
      where: {
        name,
      },
    });
  }

  async create(data: { name: string }): Promise<Department> {
    return await prismaMysql.department.create({
      data,
    });
  }

  async findByNames(names: string[]): Promise<Department[]> {
    const departments = await prismaMysql.department.findMany({
      where: {
        name: {
          in: names,
        },
      },
    });

    return departments.map((dep) => Department.createFrom(dep));
  }

  async createMany(departments: Department[]): Promise<Department[]> {
    const data = departments.map((dep) => ({
      name: dep.name,
    }));

    await prismaMysql.department.createMany({
      data,
      skipDuplicates: true, // Evita errores si ya existen con el mismo nombre
    });

    return departments;
  }
}
