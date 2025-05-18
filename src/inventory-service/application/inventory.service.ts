import { IInventoryRepository } from "../domain/interfaces/inventory.interface";
import { Inventory } from "../domain/entity/inventory";
import { HistoricalMovementRepository } from "../../historical-movement/infraestructure/repository/historical-movement.repository"; // Importamos el repositorio de movimientos históricos
import { CreateInventoryDto } from "../infraestructure/dto/create-inventory.dto";

export class InventoryService {
  private historicalMovementRepository = new HistoricalMovementRepository();

  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async createOrUpdate(
    inventoryData: CreateInventoryDto,
    userId: string
  ): Promise<Inventory> {
    const existingInventory =
      await this.inventoryRepository.findByProductAndStore(
        inventoryData.productId,
        inventoryData.storeId
      );

    if (existingInventory && existingInventory.id) {
      // Si el inventario ya existe, actualizamos la cantidad disponible
      return this.updateInventory(
        existingInventory.id,
        inventoryData.availableQuantity,
        userId
      );
    } else {
      // Si no existe, lo creamos
      return this.createInventory(inventoryData, userId);
    }
  }

  private async updateInventory(
    inventoryId: number,
    newQuantity: number,
    userId: string
  ): Promise<Inventory> {
    const updatedInventory = await this.inventoryRepository.update(
      inventoryId,
      { availableQuantity: newQuantity, lastResetDate: new Date() }
    );

    const movementType =
      newQuantity > updatedInventory.availableQuantity ? "IN" : "OUT";

    // Registramos el movimiento histórico con el userId
    await this.historicalMovementRepository.create({
      inventoryId: updatedInventory.id,
      userId: userId,
      reason: movementType === "IN" ? "Stock replenishment" : "Stock reduction",
      movementType: movementType,
    });

    return updatedInventory;
  }

  private async createInventory(
    inventoryData: CreateInventoryDto,
    userId: string
  ): Promise<Inventory> {
    const createdInventory = Inventory.createFrom({
      ...inventoryData,
      lastResetDate: new Date(),
    });

    // Registramos el movimiento histórico como una entrada 'IN' al inventario
    await this.historicalMovementRepository.create({
      inventoryId: createdInventory.id,
      userId: userId,
      reason: "Initial stock entry",
      movementType: "IN",
    });

    const inventory = await this.inventoryRepository.create(createdInventory);
    return inventory;
  }

  async getById(id: number): Promise<Inventory | null> {
    return await this.inventoryRepository.findById(id);
  }

  async update(
    id: number,
    inventoryData: Partial<Inventory>
  ): Promise<Inventory> {
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
