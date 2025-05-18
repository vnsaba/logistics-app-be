import { PrismaClient } from '../../../../prisma/generated/mysql';
import { IInventoryRepository } from '../../domain/interfaces/inventory.interface';
import { Inventory } from '../../domain/entity/inventory';

const prisma = new PrismaClient();

export class InventoryRepository implements IInventoryRepository {

  async create(inventory: Inventory): Promise<Inventory> {
    const created = await prisma.inventory.create({
      data: {
        productId: inventory.productId,
        storeId: inventory.storeId,
        availableQuantity: inventory.availableQuantity,
        minimumThreshold: inventory.minimumThreshold,
        lastResetDate: inventory.lastResetDate,
      },
    });
    return Inventory.createFrom(created);
  }

  async findById(id: number): Promise<Inventory | null> {
    const inventory = await prisma.inventory.findUnique({ where: { id } });
    return inventory ? Inventory.createFrom(inventory) : null;
  }

  async findByProductAndStore(productId: number, storeId: number): Promise<Inventory | null> {
    const inventory = await prisma.inventory.findFirst({ where: { productId, storeId } });
    return inventory ? Inventory.createFrom(inventory) : null;
  }

  async update(id: number, data: Partial<Inventory>): Promise<Inventory> {
    const updated = await prisma.inventory.update({
      where: { id },
      data,
    });
    return Inventory.createFrom(updated);
  }

  async delete(id: number): Promise<void> {
    await prisma.inventory.delete({ where: { id } });
  }

  async findAll(): Promise<Inventory[]> {
    const inventories = await prisma.inventory.findMany();
    return inventories.map(i => Inventory.createFrom(i));
  }

  async findByStore(storeId: number): Promise<Inventory[]> {
    const inventories = await prisma.inventory.findMany({
      where: { storeId }, 
      include: {
        product: true, // Incluye la relación con Product si es necesario
      },
    });

    return inventories.map(i => Inventory.createFrom(i));
  }
}
