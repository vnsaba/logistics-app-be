// infraestructure/repository/city.repository.ts
import { ICityRepository } from "../../domain/interface/city.interface";
import { prismaMysql } from "../../../db-instances";
import { City } from "../../domain/entity/city";

export class CityRepository implements ICityRepository {
  async findById(id: number): Promise<City | null> {
    const city = await prismaMysql.city.findUnique({
      where: { id },
      include: { department: true },
    });
    return city ? City.createFrom(city) : null;
  }

  async findByNameAndDepartment(
    name: string,
    departmentId: number
  ): Promise<City | null> {
    return await prismaMysql.city.findFirst({
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

    const cities = await prismaMysql.city.findMany({
      where: {
        OR: whereConditions,
      },
    });

    return cities.map((city) => City.createFrom(city));
  }

  async create(data: { name: string; departmentId: number }): Promise<City> {
    return await prismaMysql.city.create({
      data,
    });
  }

  async createMany(
    citiesData: { name: string; departmentId: number }[]
  ): Promise<City[]> {
    if (citiesData.length === 0) return [];

    await prismaMysql.city.createMany({
      data: citiesData,
      skipDuplicates: true,
    });

    const names = citiesData.map((c) => c.name);
    const departmentIds = Array.from(
      new Set(citiesData.map((c) => c.departmentId))
    );

    const cities = await prismaMysql.city.findMany({
      where: {
        name: { in: names },
        departmentId: { in: departmentIds },
      },
    });

    return cities.map((city) => City.createFrom(city));
  }

  async findAllWithDepartments(): Promise<City[]> {
    const cities = await prismaMysql.city.findMany({
      include: {
        department: true,
      },
    });

    return cities.map((city) => City.createFrom(city));
  }
}
