
import { OrderStatus } from "../../shared/enums/orderStatus.enum";
import { IOrderRepository } from "../domain/interface/order.interface";
import { IUserRepository } from "../../user-service/domain/interfaces/user.interface";
import { ISubOrderRepository } from "../domain/interface/subOrders.interface";
import { IInventoryRepository } from "../../inventory-service/domain/interfaces/inventory.interface";
import { CancelSubOrderResponse } from "./dtos/orderDto";

export class CancelSubOrderService {

    constructor(
        private readonly orderRepository: IOrderRepository,
        private readonly userRepository: IUserRepository,
        private readonly subOrdersRepository: ISubOrderRepository,
        private readonly inventoryRepository: IInventoryRepository,
    ) { }

    async cancelSubOrder(subOrderId: number): Promise<CancelSubOrderResponse> {

        // 1. Validar que la suborden existe
        const sub = await this.subOrdersRepository.findByIdWithItems(subOrderId);
        if (!sub) throw new Error("SubOrder not found");

        if (sub.status === 'CANCELED') {
            return {
                message: "Suborder already canceled",
                subOrderId: subOrderId,
                status: OrderStatus.CANCELED
            };
        }

        // 1. Cancelar suborden
        await this.subOrdersRepository.updateStatus(subOrderId, OrderStatus.CANCELED);

        // 2. Reponer inventario
        for (const item of sub.orderItems) {
            const inventory = await this.inventoryRepository.findByProductAndStore(item.productId, sub.storeId);
            if (inventory) {
                await this.inventoryRepository.update(inventory.id!, {
                    availableQuantity: inventory.availableQuantity + item.quantity,
                });
            }
        }

        // 3. Actualizar repartidor
        const delivery = await this.userRepository.findById(sub.deliveryId);
        if (!delivery) throw new Error("Delivery not found");
        if (delivery.activeOrders! > 0) {
            await this.userRepository.updateActiveOrders(delivery.id!, delivery.activeOrders! - 1);
        }

        // 4. ¿Todas las subordenes están canceladas?
        const allSubOrders = await this.orderRepository.findById(sub.orderId);
        let allCanceled = false;
        if (Array.isArray(allSubOrders)) {
            allCanceled = allSubOrders.every(s => s.status === OrderStatus.CANCELED);
        } else if (allSubOrders) {
            allCanceled = allSubOrders.status === OrderStatus.CANCELED;
        }
        if (allCanceled) {
            await this.orderRepository.updateStatus(sub.orderId, OrderStatus.CANCELED);
        }

        return {
            message: "Suborder canceled successfully",
            subOrderId: subOrderId,
            status: OrderStatus.CANCELED
        };
    }

}