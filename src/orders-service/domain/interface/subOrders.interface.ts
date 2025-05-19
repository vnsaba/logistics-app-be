import { OrderStatus } from "../../../shared/enums/orderStatus.enum";
import { SubOrderInterface } from "../../application/dtos/orderDto"

export interface ISubOrderRepository {
    updateStatus(id: number, status: OrderStatus): Promise<void>;
    findByIdWithItems(id: number): Promise<SubOrderInterface>;
    findById(id: number): Promise<SubOrderInterface | null>;
}