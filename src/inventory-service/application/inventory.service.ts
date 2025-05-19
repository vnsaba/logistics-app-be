import { IInventoryRepository } from "../domain/interfaces/inventory.interface";
import { Inventory } from "../domain/entity/inventory";
import { HistoricalMovementRepository } from "../../historical-movement/infraestructure/repository/historical-movement.repository"; // Importamos el repositorio de movimientos históricos
import { CreateInventoryDto } from "../infraestructure/dto/create-inventory.dto";
import { NotificationService } from "./notification.service";
import { EmailSenderInterface } from "src/shared/domain/interfaces/emailSender.interface";
import { IUserRepository } from "../../user-service/domain/interfaces/user.interface";
import { Product } from "../../product-service/domain/entity/product";
import { IStoreRepository } from "../..//store-service/domain/interfaces/store.interface";

export class InventoryService {
  private historicalMovementRepository = new HistoricalMovementRepository();
  private notificationService: NotificationService;
  private inventoryRepository: IInventoryRepository;

  constructor(
    inventoryRepository: IInventoryRepository,
    emailSender: EmailSenderInterface,
    userRepository: IUserRepository,
    storeRepository: IStoreRepository
  ) {
    this.notificationService = new NotificationService(
      emailSender,
      userRepository,
      inventoryRepository,
      storeRepository
    );
    this.inventoryRepository = inventoryRepository;
  }

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
      {
        availableQuantity: newQuantity,
        lastResetDate: new Date(),
      }
    );

    if (!updatedInventory) {
      throw new Error("Inventory not found or could not be updated.");
    }

    if (updatedInventory.id === undefined) {
      throw new Error("El inventario actualizado no tiene un ID válido.");
    }

    const movementType =
      newQuantity > updatedInventory.availableQuantity ? "IN" : "OUT";

    await this.historicalMovementRepository.create({
      inventoryId: updatedInventory.id,
      userId: userId,
      reason: movementType === "IN" ? "Stock replenishment" : "Stock reduction",
      movementType: movementType,
    });

    if (
      updatedInventory.availableQuantity < updatedInventory.minimumThreshold
    ) {
      // Enviar la notificación si el inventario está por debajo del umbral
      await this.notificationService.sendNotification(
        updatedInventory.id,
        userId
      );
    }

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

    // Guarda el inventario primero para obtener el id generado por la base de datos
    const inventory = await this.inventoryRepository.create(createdInventory);

    if (!inventory.id) {
      throw new Error("No se pudo obtener el ID del inventario creado.");
    }

    // Ahora sí, registra el movimiento histórico usando el id seguro
    await this.historicalMovementRepository.create({
      inventoryId: inventory.id,
      userId: userId,
      reason: "Initial stock entry",
      movementType: "IN",
    });

    if (inventory.availableQuantity < inventory.minimumThreshold) {
      // Enviar la notificación si el inventario está por debajo del umbral
      await this.notificationService.sendNotification(inventory.id, userId);
    }

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

  async getProductById(productId: number): Promise<Product | null> {
    return await this.inventoryRepository.findProductByProductId(productId);
  }

  
}
