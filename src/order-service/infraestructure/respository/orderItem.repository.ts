import { OrderItem } from "prisma/generated/mysql";
import { IOrderItemRepository } from "../../domain/interface/orderItem.interface";
import { prismaMysql } from "../../../../prisma/index";
import { UpdateOrderItemDto } from "../../domain/Dto/UpdateOrderItemDto";


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

    async findByOrderId(orderId: number): Promise<OrderItem[]> {
        const items = await prismaMysql.orderItem.findMany({
            where: { orderId: orderId }
        });
        return items;
    }
}