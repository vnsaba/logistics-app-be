import { IStoreRepository } from "../domain/interfaces/store.interface";
import { FileReaderInterface } from "../../shared/domain/interfaces/fileReader.interface";
import { DepartmentRepository } from "../../department-service/infraestructure/repository/department.repository";
import { CityRepository } from "../../city-service/infraestructure/repository/city.repository";
import { UserRepository } from "../../user-service/infraestructure/repository/user.repository"; // Para crear los usuarios
import { Store } from "../domain/entity/store";
import { StoreCsvData } from "../../shared/domain/interfaces/storeCsvData.interface";

export class UploadStoreService {
  private departmentRepository: DepartmentRepository;
  private cityRepository: CityRepository;
  private storeRepository: IStoreRepository;
  private userRepository: UserRepository;

  constructor(
    storeRepository: IStoreRepository,
    private readonly fileReader: FileReaderInterface
  ) {
    // Instanciamos los repositorios necesarios
    this.departmentRepository = new DepartmentRepository();
    this.cityRepository = new CityRepository();
    this.userRepository = new UserRepository();
    this.storeRepository = storeRepository;
  }

  async upload<F, T>({
    file,
    separator,
  }: {
    file: F;
    separator: string;
  }): Promise<{ successCount: number; errors: string[] }> {
    const { data, error } = await this.fileReader.read<T>({
      file,
      separator,
    });

    if (error) {
      return { successCount: 0, errors: ["Could not process the file"] };
    }

    // console.log("Data read from file:", data);

    const errors: string[] = [];
    const successCount = await this.processStores(
      data as StoreCsvData[],
      errors
    ); // Aseguramos que los datos sean del tipo StoreCsvData

    return { successCount, errors };
  }

  private async processStores(
    data: StoreCsvData[],
    errors: string[]
  ): Promise<number> {
    let successCount = 0;

    console.log("Processing stores...");

    for (const row of data) {
      try {
        // Validar datos del CSV antes de proceder
        this.validateStoreData(row);

        // 1. Crear o buscar el departamento
        const department = await this.createOrGetDepartment(row.departamento);

        // 2. Crear o buscar la ciudad, asegurándose de que la ciudad esté relacionada con el departamento
        const city = await this.createOrGetCity(row.ciudad, department.id);

        // 3. Crear el almacén con los datos del CSV
        await this.createStore(row, city.id);

        // 4. Crear el usuario correspondiente con el rol "Gerente"
        await this.createUserForStore(row);

        successCount++;
      } catch (err) {
        if (err instanceof Error) {
          errors.push(
            `Error processing store ${row.id_almacen}: ${err.message}`
          );
        } else {
          errors.push(`Unknown error processing store ${row.id_almacen}`);
        }
      }
    }

    return successCount;
  }

  private validateStoreData(row: StoreCsvData) {
    if (!row.id_almacen || !row.nombre_almacen || !row.direccion) {
      throw new Error("Store ID, name, and address are required.");
    }

    if (isNaN(row.latitud) || isNaN(row.longitud)) {
      throw new Error("Latitude and longitude must be valid numbers.");
    }

    if (!row.codigo_postal) {
      throw new Error("Postal code is required.");
    }

    if (!row.gerente || !row.telefono || !row.email) {
      throw new Error("Manager name, phone, and email are required.");
    }

    if (!this.isValidEmail(row.email)) {
      throw new Error("Invalid email format.");
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  }

  private async createOrGetDepartment(departmentName: string) {
    let department = await this.departmentRepository.findByName(departmentName);

    if (!department) {
      department = await this.departmentRepository.create({
        name: departmentName,
      });
    }

    return department;
  }

  private async createOrGetCity(cityName: string, departmentId: number) {
    let city = await this.cityRepository.findByNameAndDepartmentId(
      cityName,
      departmentId
    );

    if (!city) {
      city = await this.cityRepository.create({
        name: cityName,
        departmentId,
      });
    }

    return city;
  }

  private async createStore(storeData: StoreCsvData, cityId: number) {
    const storeStatus = this.mapStatus(storeData.estado);
    const store = new Store(
      storeData.id_almacen,
      storeData.nombre_almacen,
      storeData.direccion,
      cityId,
      Number(storeData.capacidad_m2),
      Number(storeData.latitud),
      Number(storeData.longitud),
      Number(storeData.codigo_postal),
      storeStatus
    );

    // console.log("Creating store:", store);

    return await this.storeRepository.create(store);
  }

  private mapStatus(status: string): "ACTIVE" | "INACTIVE" {
    if (status.toLowerCase() === "activo") {
      return "ACTIVE";
    } else if (status.toLowerCase() === "mantenimiento") {
      return "INACTIVE";
    } else {
      throw new Error(`Invalid store status: ${status}`);
    }
  }

  private async createUserForStore(row: StoreCsvData) {
    const status = "ACTIVE" as const;
    const userData = {
      email: row.email,
      fullname: row.gerente,
      phone: row.telefono,
      roleId: "6808560c7c58de59c8a68617", // cambiar luego
      current_password: "Test1234@",
      status,
      created_at: new Date(),
      updated_at: new Date(),
      resetPasswordToken: null,
      verificationCode: null,
      verificationCodeExpires: null,
      twoFactorCode: null,
      twoFactorExpires: null,
    };

    // console.log("Creating user for store:", userData);

    await this.userRepository.createUser(userData); // Usar el endpoint para crear el usuario
  }
}
