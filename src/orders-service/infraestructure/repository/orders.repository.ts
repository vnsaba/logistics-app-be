import { Order } from "../../domain/entity/order";
import { IOrderRepository } from "../../domain/interface/order.interface";
import { CreateOrderResponseDto, OrderWithSubOrdersDto } from "../../application/dtos/orderDto";
import { UpdateOrderDto } from "../../application/dtos/updateOrderDto";
import { prismaMysql } from "../../../../prisma/index";
import { OrderStatus } from "../../../shared/enums/orderStatus.enum";

export class OrdersRepository implements IOrderRepository {

    async create(order: CreateOrderResponseDto): Promise<Order> {
        return await prismaMysql.order.create({
            data: {
                customerId: order.customerId,
                status: OrderStatus.PENDING,
                totalAmount: order.totalAmount,
                latitude: order.latitude,
                longitude: order.longitude,
                address: order.address,
                createdAt: new Date(),
                updatedAt: new Date(),
                subOrders: {
                    create: order.subOrders.map((subOrder) => ({
                        deliveryId: subOrder.deliveryId,
                        status: OrderStatus.PENDING,
                        subTotal: subOrder.subTotal,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        store: {
                            connect: { id: subOrder.storeId },
                        },
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
                },
            },
            include: {
                subOrders: {
                    include: {
                        store: true,
                        orderItems: true,
                    },
                },
            },
        });
    }

    async findById(id: number, options?: any): Promise<OrderWithSubOrdersDto> {
        const order = await prismaMysql.order.findUnique({
            where: { id: Number(id) },
            include: {
                subOrders: {
                    include: {
                        orderItems: true,
                        store: true,
                    }
                }
            },
            ...(options || {}),
        });
        if (!order) {
            throw new Error(`Order with id ${id} not found`);
        }
        // Adapt the result to OrderWithSubOrdersDto if necessary
        return order as unknown as OrderWithSubOrdersDto;
    }


    async findByOrder(id: number): Promise<Order> {
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

    async update(id: number, order: UpdateOrderDto): Promise<Order> {
        return await prismaMysql.order.update({
            where: { id },
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

    //para cancelar la orden tambien se puede usar el update
    async updateStatus(id: number, status: OrderStatus): Promise<Order> {
        return await prismaMysql.order.update({
            where: { id },
            data: { status: status }
        });
    }

    async findByClientId(clientId: string): Promise<Order[]> {
        return await prismaMysql.order.findMany({
            where: { customerId: clientId },
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

}