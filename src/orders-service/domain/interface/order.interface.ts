import { Order } from "../entity/order";

export interface OrderInterface {
    create(order:Order): Promise<Order>;
    findById(id:string): Promise<Order>;
    findAll(): Promise<Order[]>;
    update(id:string, order:Order): Promise<Order>;
    delete(id:string): Promise<void>;
}