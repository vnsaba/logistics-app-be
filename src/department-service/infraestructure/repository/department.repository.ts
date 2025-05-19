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
}
