import { IStoreRepository } from "../domain/interfaces/store.interface";
import { FileReaderInterface } from "../../shared/domain/interfaces/fileReader.interface";
import { DepartmentRepository } from "../../department-service/infraestructure/repository/department.repository";
import { CityRepository } from "../../city-service/infraestructure/repository/city.repository";
import { UserRepository } from "../../user-service/infraestructure/repository/user.repository";
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

    const storesData = data as StoreCsvData[];

    const errors: string[] = [];

    // Validación preliminar de todas las filas
    storesData.forEach((row, idx) => {
      try {
        this.validateStoreData(row);
      } catch (err) {
        errors.push(`Row ${idx + 1}: ${(err as Error).message}`);
      }
    });

    if (errors.length) {
      return { successCount: 0, errors };
    }

    // --- Paso 1: Procesar Departamentos en batch ---
    const uniqueDepartments = Array.from(
      new Set(storesData.map((s) => s.departamento.trim()))
    );

    // Buscar departamentos existentes
    const existingDepartments =
      await this.departmentRepository.findByNames(uniqueDepartments);
    const existingDeptMap = new Map(
      existingDepartments.map((d) => [d.name.trim(), d])
    );

    // Crear departamentos que no existan
    const departmentsToCreate = uniqueDepartments.filter(
      (name) => !existingDeptMap.has(name)
    );
    const createdDepartments = await this.departmentRepository.createMany(
      departmentsToCreate.map((name) => ({ name }))
    );

    // Mapear todos los departamentos (existentes + creados)
    createdDepartments.forEach((d) => existingDeptMap.set(d.name.trim(), d));

    // --- Paso 2: Procesar Ciudades en batch ---
    // Mapeamos ciudades agrupadas por departamento
    const deptCityMap = new Map<string, Set<string>>();
    storesData.forEach((row) => {
      const deptName = row.departamento.trim();
      const cityName = row.ciudad.trim();
      if (!deptCityMap.has(deptName)) deptCityMap.set(deptName, new Set());
      deptCityMap.get(deptName)!.add(cityName);
    });

    // Construimos array de { cityName, departmentId }
    const cityRequests: { name: string; departmentId: number }[] = [];
    for (const [deptName, citySet] of deptCityMap.entries()) {
      const department = existingDeptMap.get(deptName);
      if (!department) {
        console.warn(`Department not found for: ${deptName}`);
        continue;
      }
      citySet.forEach((cityName) => {
        cityRequests.push({ name: cityName, departmentId: department.id! });
      });
    }

    // Buscar ciudades existentes (por nombre y departamento)
    const existingCities =
      await this.cityRepository.findByNameDepartmentPairs(cityRequests);
    const existingCityMap = new Map(
      existingCities.map((c) => [`${c.name.trim()}_${c.departmentId}`, c])
    );

    // Filtrar ciudades que faltan crear
    const citiesToCreate = cityRequests.filter(
      (c) => !existingCityMap.has(`${c.name.trim()}_${c.departmentId}`)
    );

    // Crear ciudades faltantes
    const createdCities = await this.cityRepository.createMany(citiesToCreate);

    // Mapear todas las ciudades
    createdCities.forEach((c) =>
      existingCityMap.set(`${c.name.trim()}_${c.departmentId}`, c)
    );

    // --- Paso 3: Procesar Almacenes en batch ---
    // Filtrar almacenes únicos por id_almacen
    const uniqueStoreIds = Array.from(
      new Set(storesData.map((s) => s.id_almacen.trim()))
    );

    // Buscar almacenes existentes
    const existingStores =
      await this.storeRepository.findByIdAlmacenes(uniqueStoreIds);
    const existingStoreMap = new Map(
      existingStores.map((s) => [s.id_almacen.trim(), s])
    );

    // Preparar almacenes para crear (filtrando los que no existen)
    const storesToCreate: Store[] = [];

    for (const row of storesData) {
      if (existingStoreMap.has(row.id_almacen.trim())) continue; // Ya existe
      const department = existingDeptMap.get(row.departamento.trim());
      const city = existingCityMap.get(
        `${row.ciudad.trim()}_${department?.id}`
      );

      if (!department || !city) {
        errors.push(
          `Data inconsistency for store ${row.id_almacen}: missing city or department.`
        );
        continue;
      }

      const storeStatus = this.mapStatus(row.estado);

      storesToCreate.push(
        new Store(
          row.id_almacen,
          row.nombre_almacen,
          row.direccion,
          city.id,
          Number(row.capacidad_m2),
          Number(row.latitud),
          Number(row.longitud),
          Number(row.codigo_postal),
          storeStatus
        )
      );
    }

    // Crear almacenes batch
    const createdStores = await this.storeRepository.createMany(storesToCreate);

    // Mapear todos los almacenes
    createdStores.forEach((s) => existingStoreMap.set(s.id_almacen.trim(), s));

    // --- Paso 4: Crear usuarios en batch, evitando duplicados ---

    // Extraer emails únicos
    const uniqueEmails = Array.from(
      new Set(storesData.map((s) => s.email.trim().toLowerCase()))
    );

    // Buscar usuarios existentes por email
    const existingUsers = await this.userRepository.findByEmails(uniqueEmails);
    const existingEmailsSet = new Set(
      existingUsers.map((u) => u.email.toLowerCase())
    );

    const usersToCreate = storesData.filter(
      (s) => !existingEmailsSet.has(s.email.trim().toLowerCase())
    );

    const usersData = usersToCreate.map((row) => ({
      email: row.email,
      fullname: row.gerente,
      phone: row.telefono,
      roleId: "6808560c7c58de59c8a68617",
      current_password: "Test1234@",
      status: "ACTIVE" as const,
      created_at: new Date(),
      updated_at: new Date(),
      resetPasswordToken: null,
      verificationCode: null,
      verificationCodeExpires: null,
      twoFactorCode: null,
      twoFactorExpires: null,
    }));

    const createdUsers = await this.userRepository.createMany(usersData);
    createdUsers.forEach((user, i) => {
      if (user === null) {
        errors.push(`Error creating user with email ${usersData[i].email}`);
      }
    });
    return { successCount: createdStores.length, errors };
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

  private mapStatus(status: string): "ACTIVE" | "INACTIVE" {
    if (status.toLowerCase() === "activo") {
      return "ACTIVE";
    } else if (status.toLowerCase() === "mantenimiento") {
      return "INACTIVE";
    } else {
      throw new Error(`Invalid store status: ${status}`);
    }
  }
}
