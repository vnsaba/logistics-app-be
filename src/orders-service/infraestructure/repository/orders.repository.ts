import { Order } from "src/orders-service/domain/entity/order";
import { OrderInterface } from "src/orders-service/domain/interface/order.interface";
import { CreateOrderDto } from "src/orders-service/application/dtos/createOrderDto";
import { UpdateOrderDto } from "src/orders-service/application/dtos/updateOrderDto";
import { prismaMysql } from "../../../../prisma/index";
import { OrderStatus } from "../../../shared/enums/orderStatus.enum";

export class OrdersRepository implements OrderInterface {

    async create(order: CreateOrderDto): Promise<Order> {
        return await prismaMysql.order.create({
            data: {
                storeId: order.storeId,
                deliveryId: order.deliveryId,
                customerId: order.customerId,
                status: "PENDING",
                totalAmount: order.totalAmount,
                latitude: order.latitude,
                longitude: order.longitude,
                address: order.address,
                createdAt: new Date(),
                updatedAt: new Date(),
                orderItems: {
                    create: order.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                    })),
                },
            },
        })
    }

    async findById(id: string): Promise<Order> {
        return await prismaMysql.order.findUnique({
            where: { id: Number(id) },
        }).then((order) => {
            if (!order) {
                throw new Error(`Order with id ${id} not found`);
            }
            return order;
        })
    }

    findAll(): Promise<Order[]> {
        return prismaMysql.order.findMany()
    }

    async update(id: string, order: UpdateOrderDto): Promise<Order> {
        return await prismaMysql.order.update({
            where: { id: Number(id) },
            data: {
                status: order.status,
                deliveryId: order.deliveryId,
                totalAmount: order.totalAmount,
                latitude: order.latitude,
                longitude: order.longitude,
                address: order.address,
                updatedAt: new Date(),
            }
        })
    }

    // async cancelOrder(id: string): Promise<void> {
    //     return await prismaMysql.order.update({
    //         where: { id: Number(id) },
    //         data: {
    //             status: "CANCELED",
    //             updatedAt: new Date(),
    //         },
    //     }).then(() => {
    //         return;
    //     });
    // }

    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        return await prismaMysql.order.update({
            where: { id: Number(id) },
            data: { status: status  }
        });
    }
}