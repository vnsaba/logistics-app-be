import { IOrderRepository } from "../domain/interface/order.interface";
import { IStoreRepository } from "../../store-service/domain/interfaces/store.interface";
import { IProductRepository } from "../../product-service/domain/interfaces/product.interface";
import { GeocodingService } from "../../geolocation-service/domain/interface/geocoding.interface";
import { IUserRepository } from "../../user-service/domain/interfaces/user.interface";
import { IDistanceService } from "../../geolocation-service/domain/interface/distance.interface";
import { CreateOrderRequestDto, SubOrderDto } from "./dtos/orderDto";
import { CreateOrderItemDto } from "../../orderItem-service/application/dtos/createOrderItemDto";
import { OrderStatus } from "../../shared/enums/orderStatus.enum";
import { IInventoryRepository } from '../../inventory-service/domain/interfaces/inventory.interface';
import { Order } from "../domain/entity/order";

export class CreateOrderService {
    constructor(
        private readonly orderRepository: IOrderRepository,
        private readonly storeRepository: IStoreRepository,
        private readonly productRepository: IProductRepository,
        private readonly geocodingService: GeocodingService,
        private readonly userRepository: IUserRepository,
        private readonly distanceService: IDistanceService,
        private readonly inventoryRepository: IInventoryRepository
    ) { }

    async createOrder(order: CreateOrderRequestDto): Promise<Order> {
        const { latitude, longitude } = await this.geocodingService.geocode(order.address);

        //validar que el cliente existe
        await this.validateClient(order.customerId);

        //agrupar productos por tienda
        const productsByStore = this.groupProductsByStore(order.subOrders);

        //construir subordenes con asignacion automatica de repartidor
        const subOrders = await this.buildSubOrders(productsByStore);
        console.log("subOrders:", JSON.stringify(subOrders, null, 2));
        // Calcular total general del pedido
        const totalAmount = subOrders.reduce((sum, sub) => sum + sub.subTotal, 0);

        // Crear la orden principal y las subórdenes
        const result = await this.orderRepository.create({
            customerId: order.customerId,
            address: order.address,
            latitude,
            longitude,
            status: OrderStatus.PENDING,
            totalAmount,
            subOrders: subOrders

        });

        return result;
    }

    private async validateClient(clientId: string): Promise<void> {
        const client = await this.userRepository.findByClientId(clientId);
        if (!client) {
            throw new Error(`Client with id ${clientId} not found`);
        }
    }

    private groupProductsByStore(subOrders: SubOrderDto[]): Record<number, CreateOrderItemDto[]> {
        const itemsByStore: Record<number, CreateOrderItemDto[]> = {};
        for (const subOrder of subOrders) {
            if (!Array.isArray(subOrder.orderItems)) {
                throw new Error(`'orderItems' must be an array in subOrder with storeId ${subOrder.storeId}`);
            }

            if (!itemsByStore[subOrder.storeId]) {
                itemsByStore[subOrder.storeId] = [];
            }

            itemsByStore[subOrder.storeId].push(...subOrder.orderItems); // ✅ no más 'items'
        }
        return itemsByStore;
    }

    private async buildSubOrders(
        itemsByStore: Record<number, CreateOrderItemDto[]>
    ): Promise<any[]> {
        const subOrdersData = [];
        for (const [storeIdStr, items] of Object.entries(itemsByStore)) {
            const storeId = Number(storeIdStr);
            await this.validateStoreAndProducts(storeId, items);

            const selectedDelivery = await this.selectBestDelivery(storeId);

            const subTotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
            await this.validateAndDiscountInventory(storeId, items);

            subOrdersData.push({
                storeId,
                deliveryId: selectedDelivery.id,
                status: "PENDING",
                subTotal,
                orderItems: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                }))
            });
        }
        return subOrdersData;
    }

    private async validateStoreAndProducts(storeId: number, items: CreateOrderItemDto[]): Promise<void> {
        const store = await this.storeRepository.findById(storeId);
        if (!store) throw new Error(`Store with id ${storeId} not found`);
        for (const item of items) {
            const product = await this.productRepository.findById(item.productId);
            if (!product) throw new Error(`Product with id ${item.productId} not found`);
            const productoExist = await this.inventoryRepository.findByProductAndStore(storeId, item.productId);
            if (!productoExist) throw new Error(`Product with id ${item.productId} not found in store ${storeId}`);
            if (productoExist.availableQuantity < item.quantity) {
                throw new Error(`Product with id ${item.productId} not enough in store ${storeId}`);
            }
        }
    }

    private async selectBestDelivery(storeId: number): Promise<any> {
        const store = await this.storeRepository.findById(storeId);
        const deliveries = await this.userRepository.getAllDeliveries(true);
        const validDeliveries = deliveries //esto es para filtrar los repartidores que tienen latitud y longitud
            .filter(delivery => delivery.id && delivery.latitude !== null && delivery.longitude !== null)
            .map(delivery => ({
                id: String(delivery.id),
                latitude: delivery.latitude as number,
                longitude: delivery.longitude as number,
                activeOrders: delivery.activeOrders ?? 0,
                isAvaliable: delivery.isAvaliable
            }));

        if (validDeliveries.length === 0) throw new Error('No delivery person available');

        const distances = await this.distanceService.getDistancesFromGoogle( //calcula las distancias de los repartidores a la tienda
            store!.latitude,
            store!.longitude,
            validDeliveries
        );

        let selected = null;
        let minScore = Infinity;
        for (const delivery of validDeliveries) {
            const deliveryDistance = distances.find(d => d.deliveryId === delivery.id)?.distance ?? Infinity;
            const score = deliveryDistance + (delivery.activeOrders * 1000);
            if (score < minScore && delivery.isAvaliable) {
                minScore = score;
                selected = delivery;
            }
        }
        if (!selected) throw new Error('No delivery person could be assigned');
        return selected;
    }

    private async validateAndDiscountInventory(storeId: number, items: CreateOrderItemDto[]): Promise<void> {
        const store = await this.storeRepository.findById(storeId);
        if (!store) throw new Error(`Store with id ${storeId} not found`);

        for (const item of items) {
            const product = await this.productRepository.findById(item.productId);
            if (!product) throw new Error(`Product with id ${item.productId} not found`);

            const inventory = await this.inventoryRepository.findByProductAndStore(storeId, item.productId);
            if (!inventory) throw new Error(`Inventory for product ${item.productId} in store ${storeId} not found`);
            if (inventory.availableQuantity < item.quantity) {
                throw new Error(`Not enough stock for product ${item.productId}`);
            }

            // Descontar stock
            await this.inventoryRepository.update(inventory.id!, {
                availableQuantity: inventory.availableQuantity - item.quantity
            });
        }
    }


}