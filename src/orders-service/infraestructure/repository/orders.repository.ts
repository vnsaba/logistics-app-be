import { Order } from "src/orders-service/domain/entity/order";
import { OrderInterface } from "src/orders-service/domain/interface/order.interface";
import { PrismaClient } from '../../../../prisma/generated/mysql'
const prisma = new PrismaClient();

export class OrdersRepository implements OrderInterface {
    
    async create(order: Order): Promise<Order> {
        return await prisma.order.create({
            data: {
                storeId: order.storeId,
                deliveryId: order.deliveryId,
                customerId: order.customerId,
                status: order.status,
                totalAmount: order.totalAmount,
                latitude: order.latitude,
                longitude: order.longitude,
                address: order.address,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        })
    }

    async findById(id: string): Promise<Order> {
        return await prisma.order.findUnique({
            where: { id: Number(id) },
        }).then((order) => {
            if (!order) {
                throw new Error(`Order with id ${id} not found`);
            }
            return order;
        })
    }
    findAll(): Promise<Order[]> {
        return prisma.order.findMany()
    }
    update(id: string, order: Partial<Order> ): Promise<Order> {
        return prisma.order.update({
            where: {id:Number(id)},
            data:{
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
    delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}