import { Inventory } from "../entity/inventory";

export interface IInventoryRepository {
    //metodo para buscar el producto si si esta disponible ene sa tienda
    findByProductInStore(storeId: number, productId: number): Promise<Inventory>;
}