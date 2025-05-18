import {
  Controller,
  Route,
  Tags,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Path,
} from 'tsoa';

import { Inventory } from '../../domain/entity/inventory';
import { InventoryService } from '../../application/inventory.service';
import { InventoryRepository } from '../repository/inventory.repository';

@Route('inventories')
@Tags('Inventory')
export class InventoryController extends Controller {
  private readonly inventoryService: InventoryService;

  constructor() {
    super();
    const repository = new InventoryRepository();
    this.inventoryService = new InventoryService(repository);
  }

  @Post()
  public async createInventory(@Body() body: Inventory): Promise<Inventory> {
    return await this.inventoryService.create(body);
  }

  @Get('{id}')
  public async getInventoryById(@Path() id: number): Promise<Inventory | null> {
    return await this.inventoryService.getById(id);
  }

  @Put('{id}')
  public async updateInventory(
    @Path() id: number,
    @Body() body: Partial<Inventory>
  ): Promise<Inventory> {
    return await this.inventoryService.update(id, body);
  }

  @Delete('{id}')
  public async deleteInventory(@Path() id: number): Promise<void> {
    await this.inventoryService.delete(id);
  }

  @Get()
  public async getAllInventories(): Promise<Inventory[]> {
    return await this.inventoryService.getAll();
  }

  @Get('store/{storeId}')
  public async getInventoryByStore(@Path() storeId: number): Promise<Inventory[]> {
    return await this.inventoryService.getByStore(storeId);
  }
}
