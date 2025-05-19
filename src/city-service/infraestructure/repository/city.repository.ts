// infraestructure/repository/city.repository.ts
import { PrismaClient } from "../../../../prisma/generated/mysql";
import { City } from "../../domain/entity/city";

const prisma = new PrismaClient();

export class CityRepository {
  async findByNameAndDepartmentId(
    name: string,
    departmentId: number
  ): Promise<City | null> {
    return await prisma.city.findFirst({
      where: {
        name,
        departmentId,
      },
    });
  }

  // Crear una nueva ciudad
  async create(data: { name: string; departmentId: number }): Promise<City> {
    return await prisma.city.create({
      data,
    });
  }
}
