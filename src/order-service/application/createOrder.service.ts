import { IOrderRepository } from "../domain/interface/order.interface";
import { IStoreRepository } from "../../store-service/domain/interfaces/store.interface";
import { GeocodingService } from "../../geolocation-service/domain/interface/geocoding.interface";
import { IUserRepository } from "../../user-service/domain/interfaces/user.interface";
import { IDistanceService } from "../../geolocation-service/domain/interface/distance.interface";
import { OrderStatus } from "../../shared/enums/orderStatus.enum";
import { IInventoryRepository } from '../../inventory-service/domain/interfaces/inventory.interface';
import { CreateOrderDto} from "../domain/Dto/createOrder.dto";
import { User } from "../../user-service/domain/entity/user";
import { IlocationRepository } from '../../geolocation-service/domain/interface/Location.interface';

export class CreateOrderService {
    constructor(
        private readonly orderRepository: IOrderRepository,
        private readonly storeRepository: IStoreRepository,
        private readonly geocodingService: GeocodingService,
        private readonly userRepository: IUserRepository,
        private readonly distanceService: IDistanceService,
        private readonly inventoryRepository: IInventoryRepository,
        private readonly locationRepository: IlocationRepository, //
    ) { }

    async createOrders(payload: {
        customerId: string;
        address: string;
        cityId: string;
        suborders: {
            storeId: number;
            orderItems: { productId: number; quantity: number; unitPrice: number }[];
        }[];
    }): Promise<CreateOrderDto[]> {
        const { customerId, address, cityId, suborders } = payload;

        const client = await this.userRepository.findByClientId(customerId);
        if (!client) {
            throw new Error(`Client with id ${customerId} not found`);
        }

        const { latitude, longitude } = await this.geocodingService.geocode(address);
        await this.validateClient(customerId);

        const ordersCreated: CreateOrderDto[] = [];

        for (const sub of suborders) {
            const store = await this.storeRepository.findById(sub.storeId);
            if (!store) throw new Error(`Store with id ${sub.storeId} not found`);

            const selectedDelivery = await this.selectBestDelivery(
                String(sub.storeId),
                String(cityId)
            );

            //actualizar las ordenes del repartidor
            await this.userRepository.updateOrdersToday(selectedDelivery.id!, selectedDelivery.ordersToday! + 1);

            const subtotal = sub.orderItems.reduce(
                (sum, item) => sum + item.unitPrice * item.quantity,
                0
            );

            // Validar y actualizar inventario
            for (const item of sub.orderItems) {
                const inventory = await this.inventoryRepository.findByStoreAndProduct(
                    sub.storeId,
                    item.productId
                );

                if (!inventory || inventory.availableQuantity < item.quantity) {
                    throw new Error(
                        `Not enough stock for product ${item.productId} in store ${sub.storeId}`
                    );
                }

                await this.inventoryRepository.updateQuantity({
                    storeId: sub.storeId,
                    productId: item.productId,
                    quantity: inventory.availableQuantity - item.quantity
                });
            }

            const city = Number(cityId);
            const order = await this.orderRepository.create({
                customerId,
                address,
                latitude,
                longitude,
                status: OrderStatus.PENDING,
                subTotal: subtotal,
                storeId: sub.storeId,
                deliveryId: selectedDelivery.id!,
                orderItems: sub.orderItems,
                cityId: city,
                deliveryDate: new Date()
            });

            ordersCreated.push(order);
        }

        return ordersCreated;
    }


    private async validateClient(clientId: string): Promise<void> {
        const client = await this.userRepository.findByClientId(clientId);
        if (!client) {
            throw new Error(`Client with id ${clientId} not found`);
        }
    }

    private async selectBestDelivery(
        storeId: string,
        city: string,
    ): Promise<User> {
        const [deliveries, store] = await Promise.all([
            this.userRepository.findByDeliveries(city, storeId),
            this.storeRepository.findById(Number(storeId))
        ]);

        if (!store) throw new Error(`Store with id ${storeId} not found`);
        if (!deliveries.length) throw new Error('No delivery persons available for this store');

        // Filtrar repartidores disponibles (menos de 8 órdenes)
        const available = deliveries.filter(d => d.ordersToday! < 8);

        if (!available.length) throw new Error('All delivery persons have reached their limit today');

        const deliveryLocations = await Promise.all(
            available.map(async (d) => {
                const location = await this.locationRepository.getCurrentLocation(d.id!);
                if (!location) {
                    throw new Error(`Location not found for deliveryId: ${d.id}`);
                }
                return {
                    id: d.id!,
                    latitude: location.latitude!,
                    longitude: location.longitude!,
                };
            })
        );

        // Llamada única a Google API
        const distances = await this.distanceService.getDistancesFromGoogle(
            store.latitude,
            store.longitude,
            deliveryLocations
        );

        // Encontrar el ID con menor distancia
        let min = distances[0];
        for (const d of distances) {
            if (d.distance < min.distance) min = d;
        }

        // Retornar directamente el repartidor más cercano
        const selected = available.find(d => d.id === min.deliveryId);
        if (!selected) throw new Error('Unexpected error finding delivery by ID');

        return selected;
    }

}


