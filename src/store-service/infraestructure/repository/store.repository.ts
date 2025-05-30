import { Store } from "../../domain/entity/store";
import { prismaMysql } from "../../../../prisma/index";
import { IStoreRepository } from "../../domain/interfaces/store.interface";

export class StoreRepository implements IStoreRepository {
  // Buscar una tienda por su ID
  async findById(id: number): Promise<Store | null> {
    const store = await prismaMysql.store.findUnique({ where: { id: id } });
    return store ? Store.createFrom(store) : null;
  }

  public async create(store: Store): Promise<Store> {
    const created = await prismaMysql.store.create({
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
        userId: store.userId!,
      },
    });
    return Store.createFrom(created);
  }

  // Buscar una tienda por su nombre
  async findByName(name: string): Promise<Store | null> {
    const store = await prismaMysql.store.findUnique({ where: { name } });
    return store ? Store.createFrom(store) : null;
  }

  async findByAddress(address: string): Promise<Store | null> {
    const store = await prismaMysql.store.findUnique({ where: { address } });
    return store ? Store.createFrom(store) : null;
  }

  async update(id: number, data: Partial<Store>): Promise<Store> {
    const updatedStore = await prismaMysql.store.update({
      where: { id },
      data: {
        ...data,
      },
    });
    return Store.createFrom(updatedStore);
  }

  async delete(id: number): Promise<void> {
    await prismaMysql.store.delete({ where: { id } });
  }

  async findAll(): Promise<Store[]> {
    const stores = await prismaMysql.store.findMany();
    return stores.map((store) => Store.createFrom(store));
  }

  async findByIdAlmacen(id_almacen: string): Promise<Store | null> {
    const store = await prismaMysql.store.findUnique({ where: { id_almacen } });
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
      userId: store.userId!,
    }));

    await prismaMysql.store.createMany({
      data,
      skipDuplicates: true,
    });
    return stores;
  }

  async findByIdAlmacenes(ids: string[]): Promise<Store[]> {
    const stores = await prismaMysql.store.findMany({
      where: {
        id_almacen: { in: ids },
      },
    });
    return stores.map((store) => Store.createFrom(store));
  }

  public async findByManager(managerId: string): Promise<Store[]> {
    const stores = await prismaMysql.store.findMany({
      where: {
        userId: managerId,
      },
    });
    return stores.map((store) => Store.createFrom(store));
  }
}
