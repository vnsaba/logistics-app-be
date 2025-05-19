import { HistoricalMovement } from "../entity/historical-movement";

export interface IHistoricalMovementRepository {
  create(movement: HistoricalMovement): Promise<HistoricalMovement>;
  findById(id: number): Promise<HistoricalMovement | null>;
  findByInventoryId(inventoryId: number): Promise<HistoricalMovement[]>;
  findAll(): Promise<HistoricalMovement[]>;
}
