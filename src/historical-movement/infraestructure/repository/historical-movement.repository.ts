import { PrismaClient } from '../../../../prisma/generated/mysql';
import { IHistoricalMovementRepository } from '../../domain/interfaces/historical-movement.interface';
import { HistoricalMovement } from '../../domain/entity/historical-movement';

const prisma = new PrismaClient();

export class HistoricalMovementRepository implements IHistoricalMovementRepository {
  async create(movementData: Partial<HistoricalMovement>): Promise<HistoricalMovement> {
    const movement = HistoricalMovement.createFrom(movementData);

    const created = await prisma.historicalMovement.create({
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
    return HistoricalMovement.createFrom(created);
  }

  async findById(id: number): Promise<HistoricalMovement | null> {
    const movement = await prisma.historicalMovement.findUnique({ where: { id } });
    return movement
      ? HistoricalMovement.createFrom({
          ...movement,
          movementType: movement.movementType as "IN" | "OUT" | "ADJUSTMENT"
        })
      : null;
    return movement ? HistoricalMovement.createFrom(movement) : null;
  }

  async findByInventoryId(inventoryId: number): Promise<HistoricalMovement[]> {
    const movements = await prisma.historicalMovement.findMany({ where: { inventoryId } });
    return movements.map(movement =>
      HistoricalMovement.createFrom({
        ...movement,
        movementType: movement.movementType as "IN" | "OUT" | "ADJUSTMENT"
      })
    );
    return movements.map(HistoricalMovement.createFrom);
  }

  async findAll(): Promise<HistoricalMovement[]> {
    const movements = await prisma.historicalMovement.findMany();
    return movements.map(movement =>
      HistoricalMovement.createFrom({
        ...movement,
        movementType: movement.movementType as "IN" | "OUT" | "ADJUSTMENT"
      })
    );

    return movements.map(HistoricalMovement.createFrom);
  }
}
