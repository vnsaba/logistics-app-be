import { OrderStatus } from "../../shared/enums/orderStatus.enum";
import { IOrderRepository } from "../domain/interface/order.interface";
import { GeocodingService } from "../../geolocation-service/domain/interface/geocoding.interface";

export class UpdateOrderService {
    constructor(
        private readonly orderRepository: IOrderRepository,
        private readonly geocodingService: GeocodingService,
    ) { }

    //actualizar la direccion de la orden
    async updateOrder(id: number, address: string ): Promise<void> {
        const order = await this.orderRepository.findById(id);

        if (!order) throw new Error("Order not found");

        if (order.status !== OrderStatus.PENDING ) {
            throw new Error("error order");
        }

        //verificar si hay un cambio de direccion
        if (order.address && order.address !== address) {
            //obtener latitud y longitud de la direccion
            const { latitude, longitude } = await this.geocodingService.geocode(address);

            await this.orderRepository.update(id, {
                address: address,
                latitude: latitude,
                longitude: longitude
            });
        }

    }


}