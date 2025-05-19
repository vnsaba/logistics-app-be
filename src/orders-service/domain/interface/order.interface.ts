import { CreateOrderDto } from "src/orders-service/application/dtos/orderDto";
import { Order } from "../entity/order";
import { UpdateOrderDto } from "../../application/dtos/updateOrderDto";
import { OrderStatus } from "../../../shared/enums/orderStatus.enum";

export interface OrderInterface {
    create(order:CreateOrderDto): Promise<Order>;
    findById(id:number): Promise<Order>;
    findAll(): Promise<Order[]>;
    update(id:string, order:UpdateOrderDto): Promise<Order>;
    updateStatus(id:string, status:OrderStatus): Promise<Order>;
}