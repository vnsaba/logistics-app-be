import { OrderStatus } from "../../shared/enums/orderStatus.enum";
import { IOrderRepository } from "../domain/interface/order.interface";
import { IUserRepository } from "../../user-service/domain/interfaces/user.interface";
import { ISubOrderRepository } from "../domain/interface/subOrders.interface";
import { IInventoryRepository } from "../../inventory-service/domain/interfaces/inventory.interface";

export class CancelOrderService {
    constructor(
        private readonly orderRepository: IOrderRepository,
        private readonly userRepository: IUserRepository,
        private readonly subOrdersRepository: ISubOrderRepository,
        private readonly inventoryRepository: IInventoryRepository,
    ) { }

    async cancelOrder(orderId: number): Promise<void> {
        const order = await this.orderRepository.findById(orderId, {
            include: {
                subOrders: {
                    include: {
                        orderItems: true
                    }
                }
            }
        });

        if (!order) throw new Error("Order not found");

        await this.orderRepository.updateStatus(orderId, OrderStatus.CANCELED);

        await Promise.all(order.subOrders.map(async (sub) => {
            await this.subOrdersRepository.updateStatus(sub.id, OrderStatus.CANCELED);

            // Liberar al repartidor
            if (sub.deliveryId) {
                const delivery = await this.userRepository.findById(sub.deliveryId);
                if (delivery?.activeOrders && delivery.activeOrders > 0) {
                    await this.userRepository.updateActiveOrders(delivery.id!, delivery.activeOrders - 1);
                }
            }

            // Reponer inventario
            for (const item of sub.orderItems) {
                const inventory = await this.inventoryRepository.findByProductAndStore(item.productId, sub.storeId);
                if (inventory) {
                    const newStock = inventory.availableQuantity + item.quantity;
                    await this.inventoryRepository.update(inventory.id!, { availableQuantity: newStock });
                }
            }
        }));
    }

}
