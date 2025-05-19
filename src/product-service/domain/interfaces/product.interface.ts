import { Product } from "../entity/product";

export interface IProductRepository {
  create(product: Product): Promise<Product>;
  findById(id: number): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  update(id: number, product: Partial<Product>): Promise<Product>;
  delete(id: number): Promise<void>;
  createMany(products: Product[]): Promise<Product[]>;
  findByProductId(id: string): Promise<Product | null>;
  findByProductIds(id_productos: string[]): Promise<Product[]>;
}
