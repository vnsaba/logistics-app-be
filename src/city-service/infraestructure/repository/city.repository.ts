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

  async findByNameDepartmentPairs(
    pairs: { name: string; departmentId: number }[]
  ): Promise<City[]> {
    if (pairs.length === 0) return [];

    const whereConditions = pairs.map((pair) => ({
      name: pair.name,
      departmentId: pair.departmentId,
    }));

    const cities = await prisma.city.findMany({
      where: {
        OR: whereConditions,
      },
    });

    return cities.map((city) => City.createFrom(city));
  }

  async create(data: { name: string; departmentId: number }): Promise<City> {
    return await prisma.city.create({
      data,
    });
  }

  async createMany(
    citiesData: { name: string; departmentId: number }[]
  ): Promise<City[]> {
    if (citiesData.length === 0) return [];

    await prisma.city.createMany({
      data: citiesData,
      skipDuplicates: true,
    });

    const names = citiesData.map((c) => c.name);
    const departmentIds = Array.from(
      new Set(citiesData.map((c) => c.departmentId))
    );

    const cities = await prisma.city.findMany({
      where: {
        name: { in: names },
        departmentId: { in: departmentIds },
      },
    });

    return cities.map((city) => City.createFrom(city));
  }
}
