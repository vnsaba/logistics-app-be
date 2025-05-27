import { IOrderRepository } from "../domain/interface/order.interface";
import { IStoreRepository } from "../../store-service/domain/interfaces/store.interface";
import { GeocodingService } from "../../geolocation-service/domain/interface/geocoding.interface";
import { IUserRepository } from "../../user-service/domain/interfaces/user.interface";
import { IDistanceService } from "../../geolocation-service/domain/interface/distance.interface";
import { OrderStatus } from "../../shared/enums/orderStatus.enum";
import { IInventoryRepository } from '../../inventory-service/domain/interfaces/inventory.interface';
import { CreateOrderDto, CreateOrderResponseDto } from "../domain/Dto/createOrder.dto";
import { User } from "../../user-service/domain/entity/user";

export class CreateOrderService {
    constructor(
        private readonly orderRepository: IOrderRepository,
        private readonly storeRepository: IStoreRepository,
        private readonly geocodingService: GeocodingService,
        private readonly userRepository: IUserRepository,
        private readonly distanceService: IDistanceService,
        private readonly inventoryRepository: IInventoryRepository,
    ) { }

    async createOrder(order: CreateOrderResponseDto): Promise<CreateOrderDto> {
        const client = await this.userRepository.findByClientId(order.customerId);
        if (!client) {
            throw new Error(`Client with id ${order.customerId} not found`);
        }

        const { latitude, longitude } = await this.geocodingService.geocode(order.address);

        await this.validateClient(order.customerId);
        console.log("storeId", order.storeId);

        const store = await this.storeRepository.findById(order.storeId);
        console.log("store", store);
        if (!store) {
            throw new Error(`Store with id ${order.storeId} not found`);
        }

        const selectedDelivery = await this.selectBestDelivery(String(order.storeId), String(order.cityId)); //y que esten activo el repartidor

        const subtotal = order.orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

        // Actualizar inventario por cada producto
        for (const item of order.orderItems) {
            const inventory = await this.inventoryRepository.findByStoreAndProduct(order.storeId, item.productId);
            if (!inventory) {
                throw new Error(`Inventory for product ${item.productId} in store ${order.storeId} not found`);
            }

            if (inventory.availableQuantity < item.quantity) {
                throw new Error(`Not enough stock for product ${item.productId} in store ${order.storeId}`);
            }

            const updatedQuantity = inventory.availableQuantity - item.quantity;

            await this.inventoryRepository.updateQuantity({
                storeId: order.storeId,
                productId: item.productId,
                quantity: updatedQuantity
            });
        }

        const result = await this.orderRepository.create({
            customerId: order.customerId,
            address: order.address,
            latitude,
            longitude,
            status: OrderStatus.PENDING, //esta pendiente mientras el delivery va a recoger
            subTotal: subtotal,
            storeId: order.storeId,
            deliveryId: selectedDelivery.id!,
            orderItems: order.orderItems,
            cityId: order.cityId,
            deliveryDate: new Date(), //mirar como asignar la fecha de entrega
            
        });

        return result;
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

        // Filtrar repartidores disponibles (menos de 5 órdenes)
        const available = deliveries.filter(d => d.ordersToday! < 5);

        if (!available.length) throw new Error('All delivery persons have reached their limit today');

        // Armar lista para Google Distance Matrix
        const deliveryLocations = available.map(d => ({
            id: d.id!,
            latitude: d.latitude!,
            longitude: d.longitude!
        }));

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


