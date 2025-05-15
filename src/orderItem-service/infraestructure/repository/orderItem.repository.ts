import { OrderItem } from "prisma/generated/mysql";
import { IOrderItemRepository } from "../../domain/interface/orderItem.interface";
import { prismaMysql } from "../../../../prisma/index";
// import { CreateOrderItemDto } from "../../application/dtos/createOrderItemDto";
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

    // async create(orderItem: CreateOrderItemDto): Promise<OrderItem> {
    //     return await prismaMysql.orderItem.create({
    //         data: {
    //             orderId: orderItem.orderId,
    //             productId: orderItem.productId,
    //             quantity: orderItem.quantity,
    //             unitPrice: orderItem.unitPrice
    //         }
    //     })
    // }
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
    getByOrderId(orderId: number): Promise<OrderItem[]> {
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