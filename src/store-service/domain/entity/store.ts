export class Store {
  id?: number;

  constructor(
    public name: string,
    public address: string,
    public cityId: number,
    public capacity: number,
    public latitude: number,
    public longitude: number,
    public zipCode: string,
    public status: "ACTIVE" | "INACTIVE" = "ACTIVE", 
    id?: number
  ) {
    this.validateFields(); 
    if (id) this.id = id;
  }

  private validateFields(): void {
    if (!this.name.trim() || this.name.length < 3 || this.name.length > 50) {
      throw new Error("Store name must be between 3 and 500 characters.");
    }

    if (!this.address.trim() || this.address.length < 5) {
      throw new Error("Store address must be at least 5 characters.");
    }

    if (this.cityId < 0) {
      throw new Error("City ID must be a positive number.");
    }

    if (this.capacity < 0) {
      throw new Error("Store capacity must be greater than zero.");
    }

    if (this.latitude < -90 || this.latitude > 90) {
      throw new Error("Latitude must be a valid number between -90 and 90.");
    }

    if (this.longitude < -180 || this.longitude > 180) {
      throw new Error("Longitude must be a valid number between -180 and 180.");
    }

    if (!this.zipCode.trim() || this.zipCode.length < 5) {
      throw new Error("Zip code must be valid and at least 5 characters.");
    }

    if (!["ACTIVE", "INACTIVE"].includes(this.status)) {
      throw new Error("Status must be 'ACTIVE' or 'INACTIVE'.");
    }
  }

  // Método de fábrica
  static createFrom(data: Partial<Store> & { id?: number }): Store {
    return new Store(
      data.name!,
      data.address!,
      data.cityId!,
      data.capacity!,
      data.latitude!,
      data.longitude!,
      data.zipCode!,
      data.status ?? "ACTIVE", // Default to ACTIVE if no status is provided
      data.id
    );
  }
}
