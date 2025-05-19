
// import { OrderStatus } from "../../shared/enums/orderStatus.enum";
// import { OrderInterface } from "../domain/interface/order.interface";
// import { IUserRepository } from "src/user-service/domain/interfaces/user.interface";
// import { ISubOrderInterface } from "../domain/interface/subOrders.interface";
// import { IInventoryRepository } from "../../inventory-service/domain/interfaces/inventory.interface";

// export class CancelSubOrderService {

//     constructor(
//         private readonly orderRepository: OrderInterface,
//         private readonly userRepository: IUserRepository,
//         private readonly subOrdersRepository: ISubOrderInterface,
//         private readonly inventoryRepository: IInventoryRepository,
//     ) { }

//     async cancelSubOrder(subOrderId: number): Promise<void> {
//         const sub = await this.subOrdersRepository.findByIdWithItems(subOrderId);
//         if (!sub) throw new Error("SubOrder not found");

//         if (sub.status === 'CANCELED') return;

//         // 1. Cancelar suborden
//         await this.subOrdersRepository.updateStatus(subOrderId, OrderStatus.CANCELED);

//         // 2. Reponer inventario
//         for (const item of sub.orderItems) {
//             const inventory = await this.inventoryRepo.findByProductAndStore(item.productId, sub.storeId);
//             if (inventory) {
//                 await this.inventoryRepo.update(inventory.id, {
//                     availableQuantity: inventory.availableQuantity + item.quantity,
//                 });
//             }
//         }

//         // 3. Actualizar repartidor
//         const delivery = await this.userRepo.findById(sub.deliveryId);
//         if (delivery && delivery.activeOrders > 0) {
//             await this.userRepo.updateActiveOrders(delivery.id, delivery.activeOrders - 1);
//         }

//         // 4. ¿Todas las subordenes están canceladas?
//         const allSubOrders = await this.subOrderRepo.findByOrderId(sub.orderId);
//         const allCanceled = allSubOrders.every(s => s.status === OrderStatus.CANCELED);
//         if (allCanceled) {
//             await this.orderRepo.updateStatus(sub.orderId, OrderStatus.CANCELED);
//         }
//     }

// }