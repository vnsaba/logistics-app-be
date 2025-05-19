import { StoreRepository } from '../infraestructure/repository/store.repository';
import { Store } from '../domain/entity/store';
import { CreateStoreDto } from '../infraestructure/dto/create-store.dto';
import { UpdateStoreDto } from '../infraestructure/dto/update-store.dto';

export class StoreService {
  constructor(private readonly storeRepository: StoreRepository) {}

  async create(storeData: CreateStoreDto): Promise<Store> {
    const store = Store.createFrom(storeData);
    
    const existingStore = await this.storeRepository.findByName(store.name);
    if (existingStore) {
      throw new Error('Store with this name already exists.');
    }

    const existingStoreByAddress = await this.storeRepository.findByAddress(store.address);
    if (existingStoreByAddress) {
      throw new Error('Store with this address already exists.');
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
      throw new Error('Store not found.');
    }

    // si llega un nombre, verificar que no exista
    if (storeData.name) {
      const existingStoreByName = await this.storeRepository.findByName(storeData.name);
      if (existingStoreByName && existingStoreByName.id !== id) {
        throw new Error('Store with this name already exists.');
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
      throw new Error('Store not found.');
    }

    await this.storeRepository.delete(id);
  }
}
