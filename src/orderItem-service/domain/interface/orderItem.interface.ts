import{OrderItem} from '../entity/orderItem';

export interface IOrderItemRepository {
    findById(id: number): Promise<OrderItem | null>;
    // create(orderItem: OrderItem): Promise<OrderItem>;
    update(orderItem: OrderItem): Promise<OrderItem>;
    delete(id: number): Promise<void>;
    getByOrderId(orderId: number): Promise<OrderItem[]>;
}