export class Inventory {
  id?: number;

  constructor(
    public productId: number,
    public storeId: number,
    public availableQuantity: number,
    public minimumThreshold: number,
    public lastResetDate: Date,
    public createdAt?: Date,
    public updatedAt?: Date,
    id?: number
  ) {
    this.validate();
    if (id) this.id = id;
  }

  private validate() {
    if (this.productId <= 0) {
      throw new Error("Product ID must be a positive number.");
    }
    if (this.storeId <= 0) {
      throw new Error("Store ID must be a positive number.");
    }
    if (this.availableQuantity < 0) {
      throw new Error("Available quantity cannot be negative.");
    }
    if (this.minimumThreshold < 0) {
      throw new Error("Minimum threshold cannot be negative.");
    }
    if (!(this.lastResetDate instanceof Date) || isNaN(this.lastResetDate.getTime())) {
      throw new Error("Last reset date must be a valid date.");
    }
  }

  static createFrom(data: Partial<Omit<Inventory, "id" | "createdAt" | "updatedAt">> & { id?: number; createdAt?: Date; updatedAt?: Date }): Inventory {
    return new Inventory(
      data.productId!,
      data.storeId!,
      data.availableQuantity ?? 0,
      data.minimumThreshold ?? 0,
      data.lastResetDate ? new Date(data.lastResetDate) : new Date(),
      data.createdAt,
      data.updatedAt,
      data.id
    );
  }
}
