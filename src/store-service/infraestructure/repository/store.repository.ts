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

  // Crear una nueva tienda
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
    const store = await prisma.store.findFirst({ where: { name } });
    return store ? Store.createFrom(store) : null;
  }
  // Buscar una tienda por su dirección
  async findByAddress(address: string): Promise<Store | null> {
    const store = await prisma.store.findFirst({ where: { address } });
    return store ? Store.createFrom(store) : null;
  }
  // Actualizar una tienda por ID
  async update(id: number, data: Partial<Store>): Promise<Store> {
    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        ...data, // Permite actualizar solo los campos proporcionados
      },
    });
    return Store.createFrom(updatedStore);
  }

  // Eliminar una tienda por ID
  async delete(id: number): Promise<void> {
    await prisma.store.delete({ where: { id } });
  }

  // Obtener todas las tiendas
  async findAll(): Promise<Store[]> {
    const stores = await prisma.store.findMany();
    return stores.map(store => Store.createFrom(store));
  }
}
