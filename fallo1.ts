import { OrderInterface } from "../domain/interface/order.interface";
import { Order } from "../domain/entity/order";
import { IStoreRepository } from "../../store-service/domain/interfaces/store.interface";
import { IProductRepository } from "../../product-service/domain/interfaces/product.interface";
import { GeocodingService } from "../../geolocation-service/domain/interface/geocoding.interface";
import { IUserRepository } from "../../user-service/domain/interfaces/user.interface";
import { IDistanceService } from "../../geolocation-service/domain/interface/distance.interface";
import { CreateOrderRequestDto } from "./dtos/createOrderRequestDto";

export class CreateOrderService {
    constructor(
        private readonly orderRepository: OrderInterface,
        private readonly storeRepository: IStoreRepository,
        private readonly productRepository: IProductRepository,
        private readonly geocodingService: GeocodingService,
        private readonly userRepository: IUserRepository,
        private readonly distanceService: IDistanceService
    ) { }

    async createOrder(order: CreateOrderRequestDto): Promise<Order> {
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
        if (!client) {
            throw new Error(`Client with id ${order.customerId} not found`);
        }

        //la asignacion automatica de repartidores depende de la distancia del cliente, la carga de trabajo y disponibilidad
        const deliveries = await this.userRepository.getAllDeliveries(true)
        if (deliveries.length === 0) {
            throw new Error(`No delivery person available`);
        }

        const validDeliveries = deliveries
            .filter(delivery => delivery.id && delivery.latitude !== null && delivery.longitude !== null)
            .map(delivery => ({
                id: String(delivery.id),
                latitude: delivery.latitude as number,
                longitude: delivery.longitude as number
            }));
        console.log('validDeliveries', validDeliveries);
        if (validDeliveries.length === 0) {
            throw new Error('No valid delivery person with location data available');
        }

        //calcular la distancia entre la tienda y los repartidores
        const distances = await this.distanceService.getDistancesFromGoogle(
            store.latitude,
            store.longitude,
            validDeliveries
        );
        let selected = null;
        let minScore = Infinity;
        for (const delivery of deliveries) {
            const deliveryDistance = distances.find(d => d.deliveryId === delivery.id)?.distance ?? Infinity;
            const score = deliveryDistance + ((delivery.activeOrders ?? 0) * 1000);
            if (score < minScore && delivery.isAvaliable) {
                minScore = score;
                selected = delivery;
            }
        }
        console.log('selected', selected);
        if (!selected?.id) {
            throw new Error('No delivery person could be assigned');
        }
        const totalAmount = order.items.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity,
            0
        );

        const result = await this.orderRepository.create({ ...order, totalAmount, latitude, longitude, deliveryId: selected.id });
        return result;
    }


}