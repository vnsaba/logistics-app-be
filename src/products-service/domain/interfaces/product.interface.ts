
import { Product } from '../entity/products';

export interface IProductRepository {
    findById(id: number): Promise<Product | null>;
    getAll(): Promise<Product[]>;
}