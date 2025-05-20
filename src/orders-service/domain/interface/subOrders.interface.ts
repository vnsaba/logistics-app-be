import { OrderStatus } from "../../../shared/enums/orderStatus.enum";
import { SubOrderInterface } from "../../application/dtos/orderDto"

export interface ISubOrderRepository {
    updateStatus(id: number, status: OrderStatus): Promise<void>;
    update(id: number, subOrder: SubOrderInterface): Promise<SubOrderInterface>;
    findByIdWithItems(id: number): Promise<SubOrderInterface>;
    findByOrderIdWithItems(id: number): Promise<SubOrderInterface[]>;
    findById(id: number): Promise<SubOrderInterface | null>;
    update(subOrderId: number, data: Partial<SubOrderInterface>): Promise<SubOrderInterface>
    updateSubOrder(id: number, subToral: number): Promise<void> 

}