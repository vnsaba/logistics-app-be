import { IInventoryRepository } from "../../domain/interace/invetory.interface";
import { prismaMysql } from "../../../../prisma/index";
import { Inventory } from "../../domain/entity/inventory";

export class InventoryRepository implements IInventoryRepository {

    async findByProductInStore(storeId: number, productId: number): Promise<Inventory> {
        // Simulando una búsqueda en la base de datos
        const inventory = await prismaMysql.inventory.findFirst({
            where: {
                storeId: storeId,
                productId: productId
            }
        });
        if (!inventory) {
            throw new Error("Inventory not found");
        }
        return inventory 
    }
}