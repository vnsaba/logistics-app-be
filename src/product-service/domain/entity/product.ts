export class Product {
  id?: number;
  id_producto: string;
  id_proveedor: string;
  sku: string;
  categoryId: number;
  name: string;
  description: string;
  unitPrice: number;
  weight: number;
  isFragile: boolean;
  dimensionsCm: string;
  imageUrl: string;
  barCode: string;
  requiredRefrigeration: boolean;
  dateOfExpiration: Date;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: Date;
  updatedAt?: Date;

  // Relaciones opcionales
  // category?: Category;
  // inventory?: Inventory[];
  // orderItems?: OrderItem[];

  constructor(
    name: string,
    description: string,
    categoryId: number,
    unitPrice: number,
    weight: number,
    isFragile: boolean,
    dimensionsCm: string,
    imageUrl: string,
    barCode: string,
    requiredRefrigeration: boolean,
    dateOfExpiration: Date,
    status: "ACTIVE" | "INACTIVE" = "ACTIVE",
    id?: number,
    id_producto?: string,
    id_proveedor?: string,
    sku?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.name = name;
    this.description = description;
    this.categoryId = categoryId;
    this.unitPrice = unitPrice;
    this.weight = weight;
    this.isFragile = isFragile;
    this.dimensionsCm = dimensionsCm;
    this.imageUrl = imageUrl;
    this.barCode = barCode;
    this.requiredRefrigeration = requiredRefrigeration;
    this.dateOfExpiration = dateOfExpiration;
    this.status = status;
    if (id) this.id = id;
    this.id_producto = id_producto ?? "";
    this.id_proveedor = id_proveedor ?? "";
    this.sku = sku ?? "";
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static createFrom(
    data: Partial<Omit<Product, "id">> & { id?: number }
  ): Product {
    return new Product(
      data.name!,
      data.description!,
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
      data.id,
      data.id_producto,
      data.id_proveedor,
      data.sku,
      data.createdAt,
      data.updatedAt
    );
  }
}