import { OrderItem } from "prisma/generated/mysql";
import { IOrderItemRepository } from "../../domain/interface/orderItem.interface";
import { prismaMysql } from "../../../../prisma/index";
import { UpdateOrderItemDto } from "../../application/dtos/UpdateOrderItemDto";


export class OrderItemRepository implements IOrderItemRepository {
    async findById(id: number): Promise<OrderItem | null> {
        return await prismaMysql.orderItem.findUnique({
            where: { id: Number(id) },
        }).then((orderItem) => {
            if (!orderItem) {
                return null;
            }
            return orderItem;
        })
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
}