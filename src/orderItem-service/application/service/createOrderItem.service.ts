import { CreateOrderItemDto } from "../dtos/createOrderItemDto";
import { IOrderItemRepository } from '../../domain/interface/orderItem.interface';

export class CreateOrderItemService {
    constructor(
        private readonly OrderItemRepository : IOrderItemRepository

    ){}

    async createOrderItem(orderItem: CreateOrderItemDto): Promise<any> {
        //validar que el producto exista
        const product = await this.OrderItemRepository.findById(orderItem.productId);
        if (!product) {
            throw new Error(`Product with id ${orderItem.productId} not found`);
        }

        console.log('Creating order item:', orderItem);
        return { success: true, orderItem };
        //Prisma maneja la creación en cascada directamente.


    }
}