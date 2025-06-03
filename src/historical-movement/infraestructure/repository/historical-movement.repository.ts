import { prismaMysql } from "../../../../prisma/index";
import { IHistoricalMovementRepository } from '../../domain/interfaces/historical-movement.interface';
import { HistoricalMovement } from '../../domain/entity/historical-movement';

export class HistoricalMovementRepository implements IHistoricalMovementRepository {
  async create(movementData: Partial<HistoricalMovement>): Promise<HistoricalMovement> {
    const movement = HistoricalMovement.createFrom(movementData);

    const created = await prismaMysql.historicalMovement.create({
      data: {
        inventoryId: movement.inventoryId,
        user: movement.userId,
        movementDate: movement.movementDate,
        reason: movement.reason,
        movementType: movement.movementType,
      },
    });

    return HistoricalMovement.createFrom({
      ...created,
      movementType: created.movementType as "IN" | "OUT" | "ADJUSTMENT"
    });
  }

  async findById(id: number): Promise<HistoricalMovement | null> {
    const movement = await prismaMysql.historicalMovement.findUnique({ where: { id } });
    return movement
      ? HistoricalMovement.createFrom({
          ...movement,
          movementType: movement.movementType as "IN" | "OUT" | "ADJUSTMENT"
        })
      : null;
  }

  async findByInventoryId(inventoryId: number): Promise<HistoricalMovement[]> {
    const movements = await prismaMysql.historicalMovement.findMany({ where: { inventoryId } });
    return movements.map(movement =>
      HistoricalMovement.createFrom({
        ...movement,
        movementType: movement.movementType as "IN" | "OUT" | "ADJUSTMENT"
      })
    );
  }

  async findAll(): Promise<HistoricalMovement[]> {
    const movements = await prismaMysql.historicalMovement.findMany();
    return movements.map(movement =>
      HistoricalMovement.createFrom({
        ...movement,
        movementType: movement.movementType as "IN" | "OUT" | "ADJUSTMENT"
      })
    );
  }
}
