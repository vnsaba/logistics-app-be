// application/historical-movement.service.ts
import { IHistoricalMovementRepository } from "../domain/interfaces/historical-movement.interface";
import { HistoricalMovement } from "../domain/entity/historical-movement";

export class HistoricalMovementService {
  constructor(private readonly historicalMovementRepository: IHistoricalMovementRepository) {}

  async create(movementData: Partial<HistoricalMovement>): Promise<HistoricalMovement> {
    const movement = HistoricalMovement.createFrom(movementData);
    return await this.historicalMovementRepository.create(movement);
  }

  async getAll(): Promise<HistoricalMovement[]> {
    return await this.historicalMovementRepository.findAll();
  }

  async getByInventoryId(inventoryId: number): Promise<HistoricalMovement[]> {
    return await this.historicalMovementRepository.findByInventoryId(inventoryId);
  }
}
