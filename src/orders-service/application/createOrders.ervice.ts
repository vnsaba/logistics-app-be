// import { IUOrderItemRepository } from "../../orderItem-service/domain/interface/orderItem.interface";
import { OrderInterface } from "../domain/interface/order.interface";
import { CreateOrderDto } from "./dtos/createOrderDto";
import { Order } from "../domain/entity/order";
import { IStoreRepository } from "../../store-service/domain/interfaces/store.interface";
import { IProductRepository } from "../../products-service/domain/interfaces/product.interface";

export class CreateOrderService {
    constructor(
        private readonly orderRepository: OrderInterface,
        private readonly storeRepository: IStoreRepository,
        private readonly productRepository: IProductRepository,
        // private readonly orderItemRepository: IUOrderItemRepository,
    ) { }

    async createOrder(order: CreateOrderDto): Promise<Order> {
        console.log("Creating order with the following details:", order);
        console.log("deliveryId:", order.deliveryId);
        console.log("customerId:", order.customerId);
        console.log("status:", order.status);

        console.log("product:", this.productRepository.getAll());
        const store = await this.storeRepository.findById(order.storeId);
        if (!store) {
            throw new Error(`Store with id ${order.storeId} not found`);
        }

        order.items.forEach(async (item) => {
            const product = await this.productRepository.findById(item.productId);
            if (!product) {

                throw new Error(`Product with id ${item.productId} not found`);
            }
        });

        //validar el cliente
        //validar el deliveri

        //validar que ladireccion este correctamente estrusturada


        //asignar con geocodificacion latitud y longitud


        const totalAmount = order.items.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity,
            0
        );


        const result = await this.orderRepository.create({ ...order, totalAmount });
        return result;
    }
}