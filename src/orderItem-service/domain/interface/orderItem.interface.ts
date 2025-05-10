import { OrderItem } from "prisma/generated/mysql";

export interface IUOrderItemRepository {
    findById(id: string): Promise<OrderItem | null>;
    create(orderItem: OrderItem): Promise<OrderItem>;
    update(orderItem: OrderItem): Promise<OrderItem>;
    delete(id: string): Promise<void>;
    getByOrderId(orderId: string): Promise<OrderItem[]>;
}