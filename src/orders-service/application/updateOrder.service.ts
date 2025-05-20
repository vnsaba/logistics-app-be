import { OrderStatus } from "../../shared/enums/orderStatus.enum";
import { IOrderRepository } from "../domain/interface/order.interface";
import { ISubOrderRepository } from "../domain/interface/subOrders.interface";
import { GeocodingService } from "../../geolocation-service/domain/interface/geocoding.interface";
import { IOrderItemRepository } from "../../orderItem-service/domain/interface/orderItem.interface";
import { IUserRepository } from "../../user-service/domain/interfaces/user.interface";
import { InventoryRepository } from "../../inventory-service/infraestructure/repository/inventory.repository";


export class updateOrderService {
    constructor(
        private readonly orderRepository: IOrderRepository,
        private readonly subOrderRepository: ISubOrderRepository,
        private readonly geocodingService: GeocodingService,
        private readonly orderItemRepository: IOrderItemRepository,
        private readonly userRepository: IUserRepository,
        private readonly inventoryRepository: InventoryRepository
    ) { }

    async updateOrder(id: number, address: string): Promise<void> {
        //la order solo se cambia la latiud y longitud cuando el cliente cambia la direccion
        //la direccion solo se cambia cuando ele stado es PENDIND de resto no se puede cambiar
        const order = await this.orderRepository.findById(id);

        if (!order) throw new Error("Order not found");

        if (order.status !== OrderStatus.PENDING) {
            throw new Error("Order status is not PENDING");
        }

        //obtener latitud y longitud de la direccion
        const { latitude, longitude } = await this.geocodingService.geocode(order.address);

        //como ene sos momentos aun no hay undelivery calcular si hay un delivery de nuevo

        await this.orderRepository.update(id, {
            address: address,
            latitude: latitude,
            longitude: longitude
        });
    }

    async updateSubOrder(deliveryId: string, subOrderId: number): Promise<void> {
        const subOrder = await this.subOrderRepository.findById(subOrderId);
        if (!subOrder) throw new Error("SubOrder not found");
        if (subOrder.status !== OrderStatus.PENDING) {
            throw new Error("SubOrder must be PENDING to reassign delivery");
        }

        const delivery = await this.userRepository.findById(deliveryId);
        if (!delivery) throw new Error("Delivery not found");

        // Aumentar cantidad de órdenes activas
        const updatedActiveOrders = (delivery.activeOrders ?? 0) + 1;
        await this.userRepository.updateActiveOrders(deliveryId, updatedActiveOrders);

        await this.subOrderRepository.update(subOrderId, {
            deliveryId,
            status: OrderStatus.IN_PROGRESS
        });
    }

    async updateOrderItem(id: number, quantity: number): Promise<void> {
        if (quantity <= 0) {
            throw new Error("Quantity must be greater than 0");
        }

        // const orderItem = await this.orderItemRepository.findByOrderId(subOrderId, productId);
        //buscar ese producto en la suborden
        const orderItem = await this.orderItemRepository.findById(id);
        if (!orderItem) throw new Error("OrderItem not found");

        //buscar la suborden 
        const subOrder = await this.subOrderRepository.findById(orderItem.subOrderId);
        if (!subOrder) throw new Error("SubOrder not found");

        //verificar el estado
        if (subOrder.status !== OrderStatus.PENDING) {
            throw new Error("SubOrder status must be PENDING");
        }

        const oldTotal = orderItem.quantity * orderItem.unitPrice;
        const newTotal = quantity * orderItem.unitPrice;

        const order = await this.orderRepository.findByOrder(subOrder.orderId);

        // Buscar inventario
        const productoExist = await this.inventoryRepository.getStoreAndProductExist(subOrder.storeId, orderItem.productId);
        if (!productoExist) throw new Error(`Product with id ${orderItem.productId} not found in store ${subOrder.storeId}`);

        //  Recalcular stock: devolver cantidad anterior y verificar si hay stock suficiente para la nueva
        const stockDisponible = productoExist.availableQuantity + orderItem.quantity;

        if (stockDisponible < quantity) {
            throw new Error(`Not enough stock for product ${orderItem.productId} in store ${subOrder.storeId}`);
        }

        //  Actualizar stock
        const nuevoStock = stockDisponible - quantity;
        await this.inventoryRepository.update(productoExist.id!, {
            availableQuantity: nuevoStock
        });

        //  Actualizar OrderItem
        await this.orderItemRepository.update({
            ...orderItem,
            quantity,
            updatedAt: new Date()
        });

        //Actualizar subTotal de SubOrder
        const updatedSubTotal = subOrder.subTotal - oldTotal + newTotal;
        await this.subOrderRepository.updateSubOrder(orderItem.subOrderId, updatedSubTotal );

        // Actualizar totalAmount en Order
        const updatedTotal = order.totalAmount - oldTotal + newTotal;
        await this.orderRepository.update(order.id, { totalAmount: updatedTotal });
    }

}