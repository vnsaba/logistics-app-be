import{OrderItem} from '../entity/orderItem';

export interface IOrderItemRepository {
    findById(id: number): Promise<OrderItem | null>;
    findByOrderId(orderId: number): Promise<OrderItem[]>;
    // findByOrderId(subOrderId: number, id: number): Promise<OrderItem>;
}