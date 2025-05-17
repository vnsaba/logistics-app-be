import { OrderInterface } from "../domain/interface/order.interface";
import { CreateOrderDto } from "./dtos/createOrderDto";
import { Order } from "../domain/entity/order";
import { IStoreRepository } from "../../store-service/domain/interfaces/store.interface";
import { IProductRepository } from "../../product-service/domain/interfaces/product.interface";
import { GeocodingService } from "../../shared/domain/interfaces/geocoding.interface";
import { IUserRepository } from "../../user-service/domain/interfaces/user.interface";

export class CreateOrderService {
    constructor(
        private readonly orderRepository: OrderInterface,
        private readonly storeRepository: IStoreRepository,
        private readonly productRepository: IProductRepository,
        private readonly geocodingService: GeocodingService,
        private readonly userRepository: IUserRepository,
    ) { }

    async createOrder(order: CreateOrderDto): Promise<Order> {
        const { latitude, longitude } = await this.geocodingService.geocode(order.address);

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

        const client = await this.userRepository.findByClientId(order.customerId);
        if (!client){
            throw new Error(`Client with id ${order.customerId} not found`);
        }

        //la asignacion automatica de repartidores depende de la distancia del cliente, la carga de trabajo y disponibilidad
        const delivery = await this.userRepository.findByDeliveryId(order.deliveryId);
        if (!delivery){
            throw new Error(`Delivery with id ${order.deliveryId} not found`);
        }

        const totalAmount = order.items.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity,
            0
        );

        const result = await this.orderRepository.create({ ...order, totalAmount, latitude, longitude });
        return result;
    }
}