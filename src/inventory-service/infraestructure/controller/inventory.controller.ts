import {
  Controller,
  Route,
  Tags,
  Post,
  Get,
  Delete,
  Path,
  Middlewares,
  Body,
  Request,
} from "tsoa";

import { authMiddleware } from "../../../middleware/auth.midlleware";
import { Inventory } from "../../domain/entity/inventory";
import { InventoryService } from "../../application/inventory.service";
import { InventoryRepository } from "../repository/inventory.repository";
import { AuthenticatedRequest } from "../../../types/express.d";
import { CreateInventoryDto } from "../dto/create-inventory.dto";
import { NodemailerEmailSender } from "../../../shared/infraestructure/nodemailerEmailSender";
import { UserRepository } from "../../../user-service/infraestructure/repository/user.repository";
import { StoreRepository } from "../../../store-service/infraestructure/repository/store.repository";
import { StoreProductDto } from "../dto/StoreProduct.dto";


@Route("inventories")
@Tags("Inventory")
export class InventoryController extends Controller {
  private readonly inventoryService: InventoryService;

  constructor() {
    super();
    const repository = new InventoryRepository();
    const emailSender = new NodemailerEmailSender();
    const userRepository = new UserRepository();
    const storeRepository = new StoreRepository();

    this.inventoryService = new InventoryService(
      repository,
      emailSender,
      userRepository,
      storeRepository
    );
  }

  @Post("create-or-update")
  @Middlewares([authMiddleware])
  public async createOrUpdateInventory(
    @Body() inventoryData: CreateInventoryDto,
    @Request() req: AuthenticatedRequest
  ): Promise<Inventory> {
    const userId = req.user?.id;

    if (!userId) {
      this.setStatus(401);
      throw new Error(
        "Usuario no autenticado (información del usuario no encontrada en el token)."
      );
    }

    const inventory = await this.inventoryService.createOrUpdate(
      inventoryData,
      userId
    );

    this.setStatus(201);
    return inventory;
  }

  
  @Get("/available-products")
  public async getAllAvailableProducts(): Promise<StoreProductDto[]> {
    return await this.inventoryService.getAllWithStoreAndProduct();
  }

  @Get("{id}")
  public async getInventoryById(@Path() id: number): Promise<Inventory | null> {
    return await this.inventoryService.getById(id);
  }

  @Delete("{id}")
  public async deleteInventory(@Path() id: number): Promise<void> {
    await this.inventoryService.delete(id);
  }

  @Get()
  public async getAllInventories(): Promise<Inventory[]> {
    return await this.inventoryService.getAll();
  }

  @Get("store/{storeId}")
  public async getInventoryByStore(
    @Path() storeId: number
  ): Promise<Inventory[]> {
    return await this.inventoryService.getByStore(storeId);
  }


}

