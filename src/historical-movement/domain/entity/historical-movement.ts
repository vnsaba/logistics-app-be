export class HistoricalMovement {
  id?: number;
  movementDate: Date; 

  constructor(
    public inventoryId: number,
    public userId: string,
    public reason: string,
    public movementType: "IN" | "OUT" | "ADJUSTMENT",
    id?: number
  ) {
    this.movementDate = new Date(); 

    if (!reason.trim()) {
      throw new Error("Reason must be provided.");
    }
    if (!["IN", "OUT", "ADJUSTMENT"].includes(movementType)) {
      throw new Error("Movement type must be 'IN', 'OUT' or 'ADJUSTMENT'.");
    }
    if (id) this.id = id;
  }

  static createFrom(data: Partial<HistoricalMovement> & { id?: number }): HistoricalMovement {
    const movement = new HistoricalMovement(
      data.inventoryId!,
      data.userId!,
      data.reason!,
      data.movementType!,
      data.id
    );

    movement.movementDate = data.movementDate ? new Date(data.movementDate) : new Date();

    return movement;
  }
}
