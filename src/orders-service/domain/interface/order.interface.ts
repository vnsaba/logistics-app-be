import { CreateOrderDto } from "src/orders-service/application/dtos/createOrderDto";
import { Order } from "../entity/order";
import { UpdateOrderDto } from "../../application/dtos/updateOrderDto";
import { OrderStatus } from "../../../shared/enums/orderStatus.enum";

export interface OrderInterface {
    create(order:CreateOrderDto): Promise<Order>;
    findById(id:string): Promise<Order>;
    findAll(): Promise<Order[]>;
    update(id:string, order:UpdateOrderDto): Promise<Order>;
    // cancelOrder(id:string): Promise<void>;
    updateStatus(id:string, status:OrderStatus): Promise<Order>;
}