import { EmailSenderInterface } from "../../shared/domain/interfaces/emailSender.interface";
import { IInventoryRepository } from "../domain/interfaces/inventory.interface";
import { Inventory } from "../domain/entity/inventory";
import { IUserRepository } from "../../user-service/domain/interfaces/user.interface";
import { User } from "../../user-service/domain/entity/user";
import { Store } from "../../store-service/domain/entity/store";
import { IStoreRepository } from "../../store-service/domain/interfaces/store.interface";

export class NotificationService {
  private emailSender: EmailSenderInterface;
  private userRepository: IUserRepository;
  private inventoryRepository: IInventoryRepository;
  private storeRepository: IStoreRepository;

  constructor(
    emailSender: EmailSenderInterface,
    userRepository: IUserRepository,
    inventoryRepository: IInventoryRepository,
    storeRepository: IStoreRepository
  ) {
    this.inventoryRepository = inventoryRepository;
    this.userRepository = userRepository;
    this.emailSender = emailSender;
    this.storeRepository = storeRepository;
  }

  async sendNotification(inventoryId: number, userId: string): Promise<void> {
    const inventory = await this.getInventoryById(inventoryId);
    if (!inventory) {
      throw new Error("Inventory not found.");
    }

    const product = await this.inventoryRepository.findProductByProductId(
      inventory.productId
    );

    // El email del usuario debe ser parte de su información
    const userEmail = await this.getUserEmail(userId);
    if (!userEmail) {
      throw new Error("User email not found.");
    }

    const store = await this.getStoreById(inventory.storeId);
    if (!store) {
      throw new Error("Store not found.");
    }

    // Creamos el contenido del correo
    const subject = "⚠️ Alerta de inventario: Stock por debajo del umbral";
    const template = "inventoryAlert";
    const context = {
      userName: userEmail.fullname,
      product: product?.name,
      productId: product?.id,
      availableQuantity: inventory.availableQuantity,
      minimumThreshold: inventory.minimumThreshold,
      storeId: store.name,
    };

    // Enviamos el correo usando Nodemailer
    await this.emailSender.sendEmail({
      to: userEmail.email,
      subject,
      template,
      context,
    });
  }

  private async getInventoryById(
    inventoryId: number
  ): Promise<Inventory | null> {
    const inventory = await this.inventoryRepository.findById(inventoryId);
    if (!inventory) {
      throw new Error("Inventory not found.");
    }
    return inventory;
  }

  private async getUserEmail(userId: string): Promise<User | null> {
    // obtener el usuario por ID y devolver su correo electrónico
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }
    return user;
  }

  private async getStoreById(storeId: number): Promise<Store | null> {
    return await this.storeRepository.findById(storeId);
  }
}
