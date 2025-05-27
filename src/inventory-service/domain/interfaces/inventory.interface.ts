import { StoreProductDto } from '../../infraestructure/dto/StoreProduct.dto';
import { Product } from '../../../product-service/domain/entity/product';
import { Inventory } from '../entity/inventory';

export interface IInventoryRepository {
  create(inventory: Inventory): Promise<Inventory>;
  findById(id: number): Promise<Inventory | null>;
  findByProductAndStore(productId: number, storeId: number): Promise<Inventory | null>;
  update(id: number, data: Partial<Inventory>): Promise<Inventory>;
  delete(id: number): Promise<void>;
  findAll(): Promise<Inventory[]>;
  findByStore(storeId: number): Promise<Inventory[]>;
  findProductByProductId(id: number): Promise<Product | null>;
  getAllStoreWithProduct(): Promise<StoreProductDto[]>;
  getStoreAndProductExist(storeId: number, productId: number): Promise<Inventory | null>;
  findProductByProductId(id: number): Promise<Product | null>;
  createMany(inventories: Inventory[]): Promise<Inventory[]>;
  findByStoreAndProduct(storeId: number, productId: number): Promise<Inventory | null>;
  updateQuantity(params: { storeId: number, productId: number, quantity: number }): Promise<void>;
}
