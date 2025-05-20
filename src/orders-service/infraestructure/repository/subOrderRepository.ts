import { SubOrderInterface } from "../../application/dtos/orderDto";
import { OrderStatus } from "../../../shared/enums/orderStatus.enum";
import { ISubOrderRepository } from "../../domain/interface/subOrders.interface";
import { prismaMysql } from "../../../../prisma/index";

export class SubOrderRepository implements ISubOrderRepository {

    async findById(id: number): Promise<SubOrderInterface | null> {
        return await prismaMysql.subOrders.findUnique({
            where: { id: id },
            include: {
                orderItems: true,
                store: true,
            }
        }).then((subOrder) => {
            if (!subOrder) {
                return null;
            }
            return {
                ...subOrder,
                status: subOrder.status as OrderStatus | undefined,
                orderItems: subOrder.orderItems
            } as SubOrderInterface;
        }).catch((error) => {
            throw new Error(`Error finding suborder: ${error}`);
        })
    }

    async updateStatus(id: number, status: OrderStatus): Promise<void> {
        return await prismaMysql.subOrders.update({
            where: { id: id },
            data: { status: status },
        }).then(() => {
            return;
        }).catch((error) => {
            throw new Error(`Error updating suborder status: ${error}`);
        });
    }

    async findByOrderIdWithItems(id: number): Promise<SubOrderInterface[]> {
        return await prismaMysql.subOrders.findMany({
            where: { orderId: id },
            include: {
                orderItems: true,
                store: true,
            }
        }).then((subOrders) => {
            return subOrders.map((subOrder) => ({
                ...subOrder,
                status: subOrder.status as OrderStatus | undefined
            })) as SubOrderInterface[];
        }).catch((error) => {
            throw new Error(`Error finding suborders: ${error}`);
        });
    }

    async findByIdWithItems(id: number): Promise<SubOrderInterface> {
        return await prismaMysql.subOrders.findUnique({
            where: { id: id },
            include: {
                orderItems: true,
                store: true,
            }
        }).then((subOrder) => {
            if (!subOrder) {
                throw new Error(`SubOrder with id ${id} not found`);
            }
            return {
                ...subOrder,
                status: subOrder.status as OrderStatus | undefined,
                orderItems: subOrder.orderItems
            } as SubOrderInterface;
        }).catch((error) => {
            throw new Error(`Error finding suborder: ${error}`);
        });
    }

    async update(id: number, subOrder: SubOrderInterface): Promise<SubOrderInterface> {
        try {
            const updatedSubOrder = await prismaMysql.subOrders.update({
                where: { id: id },
                data: {
                    status: subOrder.status,
                    storeId: subOrder.storeId,
                    orderItems: {
                        create: subOrder.orderItems.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        })),
                    },
                },
                include: {
                    orderItems: true,
                    store: true,
                }
            });
            return {
                ...updatedSubOrder,
                status: updatedSubOrder.status as OrderStatus | undefined,
                orderItems: updatedSubOrder.orderItems
            } as SubOrderInterface;
        } catch (error) {
            throw new Error(`Error updating suborder: ${error}`);
        }
    }

    async updateSubOrder(id: number, subToral: number): Promise<void> {
        await prismaMysql.subOrders.update({
            where: { id: id },
            data: {
                subTotal: subToral,
            }
        });
    }

}