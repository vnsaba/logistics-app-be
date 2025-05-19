import { PrismaClient } from "../../../../prisma/generated/mysql";
import { Department } from "../../domain/entity/department";

const prisma = new PrismaClient();

export class DepartmentRepository {
  async findByName(name: string): Promise<Department | null> {
    return await prisma.department.findFirst({
      where: {
        name,
      },
    });
  }

  async create(data: { name: string }): Promise<Department> {
    return await prisma.department.create({
      data,
    });
  }

  async findByNames(names: string[]): Promise<Department[]> {
    const departments = await prisma.department.findMany({
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

    await prisma.department.createMany({
      data,
      skipDuplicates: true, // Evita errores si ya existen con el mismo nombre
    });

    return departments;
  }
}
