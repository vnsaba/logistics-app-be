import { PrismaClient } from "../../../../prisma/generated/mysql";
import { IInventoryRepository } from "../../domain/interfaces/inventory.interface";
import { Inventory } from "../../domain/entity/inventory";
import { Product } from "../../../product-service/domain/entity/product";
import { StoreProductDto } from "../dto/StoreProduct.dto";

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

  async findByProductAndStore(
    productId: number,
    storeId: number
  ): Promise<Inventory | null> {
    const inventory = await prisma.inventory.findFirst({
      where: { productId, storeId },
    });
    return inventory ? Inventory.createFrom(inventory) : null;
  }


  async getStoreAndProductExist(
    storeId: number,
    productId: number
  ): Promise<Inventory | null> {
    const inventory = await prisma.inventory.findFirst({
      where: { storeId, productId },
    });
    if (!inventory) {
      return null
    }
    return Inventory.createFrom(inventory);
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
    return inventories.map((i) => Inventory.createFrom(i));
  }

  async findByStore(storeId: number): Promise<Inventory[]> {
    const inventories = await prisma.inventory.findMany({
      where: { storeId },
      include: {
        product: true,
        product: true, // Incluye la relación con Product si es necesario

      },
    });

    return inventories.map((i) => Inventory.createFrom(i));
  }

  async findProductByProductId(productId: number): Promise<Product | null> {
    const inventory = await prisma.inventory.findFirst({
      where: { productId },
      include: {
        product: true, // Incluye el producto relacionado
      },
    });
    return inventory && inventory.product
      ? Product.createFrom(inventory.product)
      : null;
  }

  async getAllStoreWithProduct(): Promise<StoreProductDto[]> {
    const inventories = await prisma.inventory.findMany({
      include: {
        store: true,
        product: {
          include: {
            category: true,
          },
        },
      },
      where: {
        availableQuantity: {
          gt: 0,
        },
        store: {
          status: 'ACTIVE',
        },
        product: {
          status: 'ACTIVE',

        },
      },
    });

    const result: StoreProductDto[] = inventories.map((inv) => ({
      storeId: inv.store.id,
      storeName: inv.store.name,
      storeAddress: inv.store.address,
      storeLatitude: inv.store.latitude,
      storeLongitude: inv.store.longitude,

      productId: inv.product.id,
      productName: inv.product.name,
      productDescription: inv.product.description,
      unitPrice: inv.product.unitPrice,
      imageUrl: inv.product.imageUrl,
      categoryName: inv.product.category.name,
      categoryIdd: inv.product.category.id,

      availableQuantity: inv.availableQuantity,
    }));

    return result;
  }


  async createMany(inventories: Inventory[]): Promise<Inventory[]> {
    const data = inventories.map((inv) => ({
      productId: inv.productId,
      storeId: inv.storeId,
      availableQuantity: inv.availableQuantity,
      minimumThreshold: inv.minimumThreshold,
      lastResetDate: inv.lastResetDate,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
    }));

    await prisma.inventory.createMany({ data });

    return inventories;
  }
}
