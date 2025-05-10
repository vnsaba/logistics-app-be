import { OrderItem } from "prisma/generated/mysql";
import { IUOrderItemRepository } from "src/orderItem-service/domain/interface/orderItem.interface";
import { prismaMysql } from "../../../../prisma/index";
import { CreateOrderItemDto } from "../../application/dtos/createOrderItemDto";
import { UpdateOrderItemDto } from "../../application/dtos/UpdateOrderItemDto";


export class OrderItemRepository implements IUOrderItemRepository {
    async findById(id: string): Promise<OrderItem | null> {
        return await prismaMysql.orderItem.findUnique({
            where: { id: Number(id) },
        }).then((orderItem) => {
            if (!orderItem) {
                return null;
            }
            return orderItem;
        })
    }

    async create(orderItem: CreateOrderItemDto): Promise<OrderItem> {
        return await prismaMysql.orderItem.create({
            data: {
                orderId: orderItem.orderId,
                productId: orderItem.productId,
                quantity: orderItem.quantity,
                unitPrice: orderItem.unitPrice
            }
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
    async delete(id: string): Promise<void> {
        await prismaMysql.orderItem.delete({
            where: { id: Number(id) },
        });
    }
    getByOrderId(orderId: string): Promise<OrderItem[]> {
        return prismaMysql.orderItem.findMany({
            where: { orderId: Number(orderId) },
        }).then((orderItems) => {
            if (!orderItems) {
                return [];
            }
            return orderItems;
        })
    }


}