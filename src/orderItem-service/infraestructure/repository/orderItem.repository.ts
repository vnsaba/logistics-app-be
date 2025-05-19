import { OrderItem } from "prisma/generated/mysql";
import { IOrderItemRepository } from "../../domain/interface/orderItem.interface";
import { prismaMysql } from "../../../../prisma/index";
import { UpdateOrderItemDto } from "../../application/dtos/UpdateOrderItemDto";


export class OrderItemRepository implements IOrderItemRepository {
    async findById(id: number): Promise<OrderItem | null> {
        return await prismaMysql.orderItem.findUnique({
            where: { id: id }
        });
    }

    async update(orderItem: UpdateOrderItemDto): Promise<OrderItem> {
        return await prismaMysql.orderItem.update({
            where: { id: orderItem.id },
            data: {
                quantity: orderItem.quantity,
                unitPrice: orderItem.unitPrice
            }
        })
    }

    async delete(id: number): Promise<void> {
        await prismaMysql.orderItem.delete({
            where: { id: Number(id) },
        });
    }

    // async findByOrderId(orderId: number, id: number): Promise<OrderItem> {
    //     const orderItem = await prismaMysql.orderItem.findUnique({
    //         where: {
    //             subOrderId: orderId,
    //             productId: id
    //         }
    //     });
    //     if (!orderItem) {
    //         throw new Error(`OrderItem with orderId ${orderId} and id ${id} not found`);
    //     }
    //     return orderItem;
    // }
}