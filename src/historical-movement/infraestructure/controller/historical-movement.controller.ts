// infraestructure/controller/historical-movement.controller.ts
import { Route, Tags, Post, Get, Body, Path } from 'tsoa';
import { HistoricalMovementService } from '../../application/historical-movement.service';
import { HistoricalMovementRepository } from '../repository/historical-movement.repository';
import { CreateHistoricalMovementDto } from '../dto/create-historical.dto';  // Importar el DTO
import { HistoricalMovement } from '../../domain/entity/historical-movement';

@Route('historical-movements')
@Tags('HistoricalMovements')
export class HistoricalMovementController {
  private readonly historicalMovementService: HistoricalMovementService;

  constructor() {
    const repository = new HistoricalMovementRepository();
    this.historicalMovementService = new HistoricalMovementService(repository);
  }

  @Post()
  public async createMovement(@Body() body: CreateHistoricalMovementDto): Promise<HistoricalMovement> {
    return await this.historicalMovementService.create(body);
  }

  @Get()
  public async getAllMovements(): Promise<HistoricalMovement[]> {
    return await this.historicalMovementService.getAll();
  }

  @Get('{inventoryId}')
  public async getMovementsByInventoryId(@Path() inventoryId: number): Promise<HistoricalMovement[]> {
    return await this.historicalMovementService.getByInventoryId(inventoryId);
  }
}
