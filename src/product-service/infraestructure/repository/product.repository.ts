import { PrismaClient } from "../../../../prisma/generated/mysql";
import { IProductRepository } from "../../domain/interfaces/product.interface";
import { Product } from "../../domain/entity/product";

const prisma = new PrismaClient();

export class ProductRepository implements IProductRepository {
  async create(product: Product): Promise<Product> {
    return await prisma.product.create({ data: product });
  }

  async findById(id: number): Promise<Product | null> {
    return await prisma.product.findUnique({ where: { id } });
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

  async createMany(products: Product[]): Promise<Product[]> {
    const data = products.map((p) => ({
      id_producto: p.id_producto,
      id_proveedor: p.id_proveedor,
      name: p.name,
      description: p.description,
      sku: p.sku,
      categoryId: p.categoryId,
      unitPrice: p.unitPrice,
      weight: p.weight,
      isFragile: p.isFragile,
      dimensionsCm: p.dimensionsCm,
      imageUrl: p.imageUrl,
      barCode: p.barCode,
      requiredRefrigeration: p.requiredRefrigeration,
      dateOfExpiration: p.dateOfExpiration,
      status: p.status,
    }));

    await prisma.product.createMany({ data });

    return products;
  }

  async findByProductId(id_producto: string): Promise<Product | null> {
    return await prisma.product.findUnique({ where: { id_producto: id_producto } });
  }

  async findByProductIds(id_productos: string[]): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      id_producto: {
        in: id_productos,
      },
    },
  });

  return products.map(p => Product.createFrom(p));
}

}
