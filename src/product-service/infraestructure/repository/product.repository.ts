import { PrismaClient } from '../../../../prisma/generated/mysql';
import { IProductRepository } from '../../domain/interfaces/product.interface';
import { Product } from '../../domain/entity/product';

const prisma = new PrismaClient();

export class ProductRepository implements IProductRepository {
  async create(product: Product): Promise<Product> {
    return await prisma.product.create({ data: product });
  }

  async findById(id: number): Promise<Product | null> {
    return await prisma.product.findUnique({ where: { id } });
  }

  async findByBarcode(barCode: string): Promise<Product | null> {
    return await prisma.product.findUnique({ where: { barCode } });
  }

  async findAll(): Promise<Product[]> {
    return await prisma.product.findMany();
  }

  async update(id: number, data: Partial<Product>): Promise<Product> {
    return await prisma.product.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }
}
