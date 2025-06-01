import { StoreRepository } from "../infraestructure/repository/store.repository";
import { Store } from "../domain/entity/store";
import { CreateStoreDto } from "../infraestructure/dto/create-store.dto";
import { UpdateStoreDto } from "../infraestructure/dto/update-store.dto";
import { UserRepository } from "src/user-service/infraestructure/repository/user.repository";

export class StoreService {
  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly userRepository: UserRepository
  ) {}

  async create(storeData: CreateStoreDto): Promise<Store> {
    const store = Store.createFrom(storeData);

    const existingStore = await this.storeRepository.findByName(store.name);
    if (existingStore) {
      throw new Error("Store with this name already exists.");
    }

    const existingStoreByAddress = await this.storeRepository.findByAddress(
      store.address
    );

    console.log("existingStoreByAddress", existingStoreByAddress);

    if (existingStoreByAddress) {
      throw new Error("Store with this address already exists.");
    }

    return await this.storeRepository.create(store);
  }

  async getAll(): Promise<Store[]> {
    return await this.storeRepository.findAll();
  }

  async getById(id: number): Promise<Store | null> {
    return await this.storeRepository.findById(id);
  }

  async getByName(name: string): Promise<Store | null> {
    return await this.storeRepository.findByName(name);
  }

  async update(id: number, storeData: UpdateStoreDto): Promise<Store> {
    const existingStore = await this.storeRepository.findById(id);
    if (!existingStore) {
      throw new Error("Store not found.");
    }

    // si llega un nombre, verificar que no exista
    if (storeData.name) {
      const existingStoreByName = await this.storeRepository.findByName(
        storeData.name
      );
      if (existingStoreByName && existingStoreByName.id !== id) {
        throw new Error("Store with this name already exists.");
      }
    }

    const updatedData = {
      ...existingStore,
      ...storeData,
    };

    const updatedStore = Store.createFrom(updatedData);

    return await this.storeRepository.update(id, updatedStore);
  }

  async delete(id: number): Promise<void> {
    const existingStore = await this.storeRepository.findById(id);
    if (!existingStore) {
      throw new Error("Store not found.");
    }

    await this.storeRepository.delete(id);
  }

  // todo: revisar que sirva
  public async getByManager(managerId: string): Promise<Store[]> {
    const user = await this.userRepository.findById(managerId);
    if (!user) {
      throw new Error("User not found.");
    }

    if (!user.roleId) {
      throw new Error("User role not found.");
    }

    const role = await this.userRepository.getRoleById(user.roleId);

    if (role !== "GERENTE") {
      throw new Error("User is not a manager.");
    }

    return await this.storeRepository.findByManager(managerId);
  }
}
