import { IProductRepository } from '../../domain/interfaces/product.interface';
import { Product } from '../../domain/entity/product';
import { prismaMysql } from "../../../../prisma/index";


export class ProductRepository implements IProductRepository {
  async create(product: Product): Promise<Product> {
    return await prismaMysql.product.create({ data: product });
  }

  async findById(id: number): Promise<Product | null> {
    return await prismaMysql.product.findUnique({ where: { id } });
  }

  async findByBarcode(barCode: string): Promise<Product | null> {
    return await prismaMysql.product.findFirst({ where: { barCode } });
  }

  async findAll(): Promise<Product[]> {
    return await prismaMysql.product.findMany();
  }

  async update(id: number, data: Partial<Product>): Promise<Product> {
    return await prismaMysql.product.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await prismaMysql.product.delete({ where: { id } });
  }
}
