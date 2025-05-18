import { IInventoryRepository } from '../domain/interfaces/inventory.interface';
import { Inventory } from '../domain/entity/inventory';

export class InventoryService {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async create(inventoryData: Inventory): Promise<Inventory> {
    const existing = await this.inventoryRepository.findByProductAndStore(inventoryData.productId, inventoryData.storeId);
    if (existing) {
      throw new Error('Inventory record for this product and store already exists.');
    }
    return await this.inventoryRepository.create(inventoryData);
  }

  async getById(id: number): Promise<Inventory | null> {
    return await this.inventoryRepository.findById(id);
  }

  async update(id: number, inventoryData: Partial<Inventory>): Promise<Inventory> {
    return await this.inventoryRepository.update(id, inventoryData);
  }

  async delete(id: number): Promise<void> {
    await this.inventoryRepository.delete(id);
  }

  async getAll(): Promise<Inventory[]> {
    return await this.inventoryRepository.findAll();
  }

  async getByStore(storeId: number): Promise<Inventory[]> {
    return await this.inventoryRepository.findByStore(storeId);
  }
}
