import { IOrderRepository } from "../domain/interface/order.interface";
import { OrderResponseDTO } from "../domain/Dto/orderResponse.dto";
import { GeocodingService } from "../../geolocation-service/domain/interface/geocoding.interface";
import { IUserRepository } from "../../user-service/domain/interfaces/user.interface";
import { IlocationRepository } from "../../geolocation-service/domain/interface/Location.interface"

export class GetOrderDetailSerice {
    constructor(
        private readonly orderRepository: IOrderRepository,
        private readonly userRepository: IUserRepository,
        private readonly locationService: IlocationRepository,
        private readonly geocodingService: GeocodingService,
    ) { }

    async execute(orderId: number): Promise<OrderResponseDTO | null> {
        const order = await this.orderRepository.getByIdWithRelations(orderId);
        if (!order) return null;
        const [user, courier, courierLocation] = await Promise.all([
            this.userRepository.findById(order.customerId),
            this.userRepository.findById(order.deliveryId || ''),
            this.locationService.getCurrentLocation(order.deliveryId || ''),
        ]);

        let lat = null;
        let lng = null;
        let addressText = 'Ubicación no disponible';

        if (courierLocation) {
            lat = courierLocation.latitude;
            lng = courierLocation.longitude;
            try {
                addressText = await this.geocodingService.reverseGeocode(lat, lng);
            } catch (e) {
                console.warn('No se pudo obtener dirección');
            }
        }
        const possibleStatuses = ['Pending', 'Ready', 'On The Way', 'Delivered'];

        const eventMap = new Map(order.events.map(e => [e.status, e.date])); 
        console.log('Event Map:', eventMap);
        console.log('Possible Statuses:', possibleStatuses);
        console.log('Order Events:', order.events);
        const completeEvents = possibleStatuses.map(status => ({
            status,
            date: eventMap.get(status.toUpperCase()) || null,
        }));

        return {
            id: order.id,
            user: {
                id: user?.id || '',
                fullName: user?.fullname || '',
            },
            subtotal: order.subTotal,
            createdAt: order.createdAt.toISOString(),
            deliveryDate: order.deliveryDate ? order.deliveryDate.toISOString() : null,
            products: order.orderItems.map((item) => ({
                id: item.product.id,
                name: item.product.name,
                isActive: item.product.status === 'ACTIVE',
                description: item.product.description ?? '',
                images: [{
                    url: item.product.imageUrl ?? '',
                    name: item.product.name,
                }],
                createdAt: item.product.createdAt.toISOString(),
                unitPrice: item.unitPrice,
                category: 5,
            })),
            status: {
                id: 0,
                text: order.status.text,
            },
            address: {
                text: order.address,
                latitude: order.latitude ?? null,
                longitude: order.longitude ?? null,
            },
            store: {
                id: order.store.id,
                name: order.store.name,
                isActive: order.store.status === 'ACTIVE',
                createdAt: order.store.createdAt.toISOString(),
                address: {
                    text: order.store.address,
                    latitude: order.store.latitude ?? null,
                    longitude: order.store.longitude ?? null,
                },
            },
            courier: courier ? {
                id: courier.id || '',
                name: courier.fullname,
                gender: 'N/A',
                gsm: courier.phone,
                createdAt: courier.created_at.toISOString(),
                accountNumber: courier.phone,
                address: {
                    text: addressText,
                    latitude: lat,
                    longitude: lng,
                },
                status: {
                    id: 0,
                    text: courier.status,
                },
            } : null,
            events: completeEvents,
            orderNumber: order.id,
        };
    }
}
