import { IStoreRepository } from "../../store-service/domain/interfaces/store.interface";
import { IProductRepository } from "../../product-service/domain/interfaces/product.interface";
import { IUserRepository } from "../../user-service/domain/interfaces/user.interface";
import { ProductOrderInfoDto, SubOrderInfoDto } from "./dtos/orderDto";
import { ISubOrderRepository } from "../domain/interface/subOrders.interface";
import { IOrderRepository } from "../domain/interface/order.interface";


export class OrderInfoService {

    constructor(
        private readonly subOrderRepository: ISubOrderRepository,
        private readonly storeRepository: IStoreRepository,
        private readonly productRepository: IProductRepository,
        private readonly userRepository: IUserRepository,
        private readonly orderRepository: IOrderRepository,
    ) { }

    async getOrderInfo(clientId: string): Promise<SubOrderInfoDto[]> {
        const user = await this.userRepository.findById(clientId);
        if (!user) throw new Error("User not found");

        const orders = await this.orderRepository.findByClientId(clientId);
        if (!orders || orders.length === 0) throw new Error("No orders found for this user");

        const subOrderInfoList: SubOrderInfoDto[] = [];

        for (const order of orders) {
            // 🟡 Obtener TODAS las subórdenes de la orden
            const subOrders = await this.subOrderRepository.findByOrderIdWithItems(order.id);

            for (const subOrder of subOrders) {
                const store = await this.storeRepository.findById(subOrder.storeId);
                const delivery = await this.userRepository.findById(subOrder.deliveryId);

                const products: ProductOrderInfoDto[] = [];

                for (const item of subOrder.orderItems) {
                    const product = await this.productRepository.findById(item.productId);
                    if (!product) continue;

                    products.push({
                        id: product.id!,
                        name: product.name,
                        unitPrice: item.unitPrice,
                        quantity: item.quantity,
                        total: item.unitPrice * item.quantity,
                    });
                }

                subOrderInfoList.push({
                    id: order.id,
                    subOrderId: subOrder.id,
                    status: subOrder.status,
                    totalAmount: subOrder.subTotal,
                    storeName: store?.name || "Tienda no encontrada",
                    createdAt: subOrder.createdAt,
                    delivery: {
                        id: delivery?.id || "",
                        fullName: delivery?.fullname || "Sin nombre",
                        phone: delivery?.phone || "Sin teléfono",
                    },
                    products,
                });
            }
        }

        return subOrderInfoList;
    }
}