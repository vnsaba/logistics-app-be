import{OrderItem} from '../entity/orderItem';

export interface IOrderItemRepository {
    findById(id: number): Promise<OrderItem | null>;
    update(orderItem: OrderItem): Promise<OrderItem>;
    delete(id: number): Promise<void>;
}