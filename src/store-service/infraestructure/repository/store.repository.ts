import { Store } from '../../domain/entity/store';
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
import { IStoreRepository } from '../../domain/interfaces/store.interface';

export class StoreRepository implements IStoreRepository {
  async findById(id: string): Promise<Store | null> {
    // const store = await prisma.store.findUnique({ where: { id } });
    // return store;
    console.log('StoreRepository: findById called with id:', id);
    const mockStore = new Store(
      'Tienda Central',
      'Av. Siempre Viva 742',
      'city_123',
      100,
      -12.0464,
      -77.0428,
      '15001',
      'active',
      'store_001'
    );

    return mockStore;
  }

  public async create(storeData: Store): Promise<Store> {
    const {
      address,
      capacity,
      city_id,
      latitude,
      longitude,
      name,
      status,
      zip_code,
      id,
    } = storeData;

    return new Store(
      name,
      address,
      city_id,
      capacity,
      latitude,
      longitude,
      zip_code,
      status,
      id
    );
  }
}
