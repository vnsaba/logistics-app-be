import { Product } from "src/products-service/domain/entity/products";
import { IProductRepository } from "../../domain/interfaces/product.interface";
import { prismaMysql } from "../../../../prisma/index";

export class ProductsRepository implements IProductRepository {
    findById(id: number): Promise<Product | null> {
        return prismaMysql.product.findUnique({ where: { id } });
    }

    getAll(): Promise<Product[]> {
        return prismaMysql.product.findMany();
    }

}