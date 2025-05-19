export class Product {
  id?: number;

  constructor(
    public id_producto: string,
    public id_proveedor: string,
    public name: string,
    public description: string,
    public sku: string,
    public categoryId: number,
    public unitPrice: number,
    public weight: number,
    public isFragile: boolean,
    public dimensionsCm: string,
    public imageUrl: string,
    public barCode: string,
    public requiredRefrigeration: boolean,
    public dateOfExpiration: Date,
    public status: "ACTIVE" | "INACTIVE" = "ACTIVE", // Default status
    id?: number
  ) {
    if (!name.trim() || name.length < 3 || name.length > 100) {
      throw new Error("Product name must be between 3 and 100 characters.");
    }

    if (
      !description.trim() ||
      description.length < 10 ||
      description.length > 500
    ) {
      throw new Error(
        "Product description must be between 10 and 500 characters."
      );
    }
    if (!sku.trim() || sku.length < 3 || sku.length > 20) {
      throw new Error("SKU must be between 3 and 20 characters.");
    }
    if (categoryId <= 0) {
      throw new Error("Category ID must be a positive number.");
    }

    if (unitPrice <= 0) {
      throw new Error("Unit price must be greater than zero.");
    }

    if (weight <= 0) {
      throw new Error("Weight must be a positive number.");
    }

    // const dimensionsRegex = /^\d+(\.\d+)?x\d+(\.\d+)?x\d+(\.\d+)?$/;
    // if (!dimensionsRegex.test(dimensionsCm)) {
    //   throw new Error(
    //     "Dimensions must be in the format 'LxWxH' (e.g., '10x20x30')."
    //   );
    // }

    // if (imageUrl && !/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(imageUrl)) {
    //   throw new Error("Image URL must be a valid URL pointing to an image.");
    // }

    // const barCodeRegex = /^\d{13}$/;
    // if (!barCodeRegex.test(barCode)) {
    //   throw new Error("Bar code must be a 13-digit number.");
    // }

    // if (
    //   !(dateOfExpiration instanceof Date) ||
    //   isNaN(dateOfExpiration.getTime())
    // ) {
    //   throw new Error("Date of expiration must be a valid date.");
    // }

    // if (dateOfExpiration < new Date()) {
    //   throw new Error("Date of expiration cannot be in the past.");
    // }

    // const validStatuses = ["ACTIVE", "INACTIVE"];
    // if (!validStatuses.includes(status)) {
    //   throw new Error(
    //     `Status must be one of the following: ${validStatuses.join(", ")}.`
    //   );
    // }

    if (id) this.id = id;
  }

  // Método de fábrica
  static createFrom(
    data: Partial<Omit<Product, "id">> & { id?: number }
  ): Product {
    return new Product(
      data.id_producto!,
      data.id_proveedor!,
      data.name!,
      data.description!,
      data.sku!,
      data.categoryId!,
      data.unitPrice!,
      data.weight!,
      data.isFragile!,
      data.dimensionsCm!,
      data.imageUrl!,
      data.barCode!,
      data.requiredRefrigeration!,
      new Date(data.dateOfExpiration!),
      data.status ?? "ACTIVE",
      data.id
    );
  }
}
