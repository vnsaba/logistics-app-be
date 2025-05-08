import { Store } from '../../domain/entity/store';
import { IStoreRepository } from '../../domain/interfaces/store.interface';
import { PrismaClient } from '../../../../prisma/generated/mysql';

const prisma = new PrismaClient();

export class StoreRepository implements IStoreRepository {
  async findById(id: number): Promise<Store | null> {
    const store = await prisma.store.findUnique({ where: { id } });
    return store;
  }

  public async create(storeData: Store): Promise<Store> {
    const { address, capacity, cityId, latitude, longitude, name, zipCode } =
      storeData;

    return await prisma.store.create({
      data: {
        address,
        capacity,
        cityId,
        latitude,
        longitude,
        name,
        status: 'ACTIVE',
        zipCode,
      },
    });
  }
}
