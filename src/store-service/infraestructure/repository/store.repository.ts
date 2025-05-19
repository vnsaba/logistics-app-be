import { PrismaClient } from "../../../../prisma/generated/mysql";
import { Store } from "../../domain/entity/store";
import { IStoreRepository } from "../../domain/interfaces/store.interface";

const prisma = new PrismaClient();

export class StoreRepository implements IStoreRepository {
  // Buscar una tienda por su ID
  async findById(id: number): Promise<Store | null> {
    const store = await prisma.store.findUnique({ where: { id } });
    return store ? Store.createFrom(store) : null;
  }

  public async create(store: Store): Promise<Store> {
    const created = await prisma.store.create({
      data: {
        id_almacen: store.id_almacen,
        name: store.name,
        address: store.address,
        cityId: store.cityId,
        capacity: store.capacity,
        latitude: store.latitude,
        longitude: store.longitude,
        zipCode: store.zipCode,
        status: store.status,
      },
    });
    return Store.createFrom(created);
  }

  // Buscar una tienda por su nombre
  async findByName(name: string): Promise<Store | null> {
    const store = await prisma.store.findUnique({ where: { name } });
    return store ? Store.createFrom(store) : null;
  }

  async findByAddress(address: string): Promise<Store | null> {
    const store = await prisma.store.findUnique({ where: { address } });
    return store ? Store.createFrom(store) : null;
  }

  async update(id: number, data: Partial<Store>): Promise<Store> {
    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        ...data,
      },
    });
    return Store.createFrom(updatedStore);
  }

  async delete(id: number): Promise<void> {
    await prisma.store.delete({ where: { id } });
  }

  async findAll(): Promise<Store[]> {
    const stores = await prisma.store.findMany();
    return stores.map((store) => Store.createFrom(store));
  }

  async findByIdAlmacen(id_almacen: string): Promise<Store | null> {
    const store = await prisma.store.findUnique({ where: { id_almacen } });
    return store ? Store.createFrom(store) : null;
  }

  async createMany(stores: Store[]): Promise<Store[]> {
    const data = stores.map((store) => ({
      id_almacen: store.id_almacen,
      name: store.name,
      address: store.address,
      cityId: store.cityId,
      capacity: store.capacity,
      latitude: store.latitude,
      longitude: store.longitude,
      zipCode: store.zipCode,
      status: store.status,
    }));

    await prisma.store.createMany({
      data,
      skipDuplicates: true,
    });
    return stores;
  }

  async findByIdAlmacenes(ids: string[]): Promise<Store[]> {
    const stores = await prisma.store.findMany({
      where: {
        id_almacen: { in: ids },
      },
    });
    return stores.map((store) => Store.createFrom(store));
  }
}
