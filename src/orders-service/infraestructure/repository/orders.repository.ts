import { Order } from "src/orders-service/domain/entity/order";
import { OrderInterface } from "src/orders-service/domain/interface/order.interface";
import { CreateOrderDto } from "src/orders-service/application/dtos/orderDto";
import { UpdateOrderDto } from "src/orders-service/application/dtos/updateOrderDto";
import { prismaMysql } from "../../../../prisma/index";
import { OrderStatus } from "../../../shared/enums/orderStatus.enum";

export class OrdersRepository implements OrderInterface {

    async create(order: CreateOrderDto): Promise<Order> {
        return await prismaMysql.order.create({
            data: {
                customerId: order.customerId,
                status: "PENDING",
                totalAmount: order.totalAmount,
                latitude: order.latitude,
                longitude: order.longitude,
                address: order.address,
                createdAt: new Date(),
                updatedAt: new Date(),
                subOrders: {
                    create: order.subOrders.map((subOrder) => ({
                        store: {
                            connect: { id: subOrder.storeId }
                        },
                        deliveryId: subOrder.deliveryId!,
                        status: subOrder.status,
                        subTotal: subOrder.subTotal!,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        orderItems: {
                            create: subOrder.orderItems.map((item) => ({
                                productId: item.productId,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            })),
                        },
                    })),
                }
            },
        })
    }

    async findById(id: number): Promise<Order> {
        return await prismaMysql.order.findUnique({
            where: { id: Number(id) },
        }).then((order) => {
            if (!order) {
                throw new Error(`Order with id ${id} not found`);
            }
            return order;
        })
    }

    async findAll(): Promise<Order[]> {
        return await prismaMysql.order.findMany({
            include: {
                subOrders: {
                    include: {
                        orderItems: true,
                        store: true,
                    }
                }
            }
        }).then((orders) => {
            if (!orders) {
                throw new Error(`Orders not found`);
            }
            return orders;
        })
    }

    async update(id: string, order: UpdateOrderDto): Promise<Order> {
        return await prismaMysql.order.update({
            where: { id: Number(id) },
            data: {
                status: order.status,
                totalAmount: order.totalAmount,
                latitude: order.latitude,
                longitude: order.longitude,
                address: order.address,
                updatedAt: new Date(),
            }
        })
    }

    async cancelOrder(id: string): Promise<Order> {
        return await prismaMysql.order.update({
            where: { id: Number(id) },
            data: {
                status: OrderStatus.CANCELED,
                updatedAt: new Date(),
            }
        })
    }

    //para cancelar la orden tambien se puede usar el update
    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        return await prismaMysql.order.update({
            where: { id: Number(id) },
            data: { status: status }
        });
    }
}