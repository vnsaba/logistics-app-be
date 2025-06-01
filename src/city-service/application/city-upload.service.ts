import * as fs from "fs";
import * as path from "path";
import { City } from "../domain/entity/city";
import { DepartmentRepository } from "../../department-service/infraestructure/repository/department.repository";
import { CityRepository } from "../../city-service/infraestructure/repository/city.repository";

export class CityUploadService {
  private departmentRepository: DepartmentRepository;
  private cityRepository: CityRepository;

  constructor() {
    this.departmentRepository = new DepartmentRepository();
    this.cityRepository = new CityRepository();
  }

  public async uploadCitiesAndDepartments(): Promise<void> {
    const filePath = path.resolve(
      __dirname,
      "../../../assets/departamentos_ciudades.json"
    );
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    for (const entry of jsonData) {
      const { departamento, ciudades } = entry;

      let department = await this.departmentRepository.findByName(departamento);

      if (!department) {
        department = await this.departmentRepository.create({ name: departamento });
      }

      if (!department || !department.id) {
        throw new Error(`No se pudo obtener el ID del departamento: ${departamento}`);
      }

      for (const ciudad of ciudades) {
        const existingCity = await this.cityRepository.findByNameAndDepartment(
          ciudad,
          department.id 
        );

        if (!existingCity) {
          await this.cityRepository.create({
            name: ciudad,
            departmentId: department.id, 
          });
        }
      }
    }
  }

  public async getAllCities(): Promise<City[]> {
    return await this.cityRepository.findAllWithDepartments();
  }
}