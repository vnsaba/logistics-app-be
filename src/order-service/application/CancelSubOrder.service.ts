
import { OrderStatus } from "../../shared/enums/orderStatus.enum";
import { IOrderRepository } from "../domain/interface/order.interface";
import { IInventoryRepository } from "../../inventory-service/domain/interfaces/inventory.interface";
import { OrderItemRepository } from '../infraestructure/respository/orderItem.repository';

export class CancelSubOrderService {

    constructor(
        private readonly orderRepository: IOrderRepository,
        private readonly orderItemRepository: OrderItemRepository,
        private readonly inventoryRepository: IInventoryRepository,
    ) { }

    async cancelSubOrder(orderId: number): Promise<{message: string, order: number, status: OrderStatus}> {

        // 1. Validar que la suborden existe
        const order = await this.orderRepository.findById(orderId);
        if (!order){
            throw new Error("Order not found");
        }

        // 1. Cancelar orden
        await this.orderRepository.updateStatus(orderId, OrderStatus.CANCELED);

        //buscar los orderItems de esa orden
        const orderItems = await this.orderItemRepository.findByOrderId(orderId);

        // 2. Reponer inventario
        for (const item of orderItems) {
            const inventory = await this.inventoryRepository.findByProductAndStore(item.productId, order.storeId);
            if (inventory) {
                await this.inventoryRepository.update(inventory.id!, {
                    availableQuantity: inventory.availableQuantity + item.quantity,
                });
            }
        }

        return {
            message: "Suborder canceled successfully",
            order: orderId,
            status: OrderStatus.CANCELED
        };
    }

}