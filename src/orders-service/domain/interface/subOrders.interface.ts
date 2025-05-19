import { OrderStatus } from "../../../shared/enums/orderStatus.enum";

export interface ISubOrderInterface {
    canceledSubOrder(id: number, status: OrderStatus): Promise<void>;
}