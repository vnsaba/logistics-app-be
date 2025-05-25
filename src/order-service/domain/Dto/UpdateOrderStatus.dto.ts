import { OrderStatus } from "../../../shared/enums/orderStatus.enum";

export interface UpdateOrderStatusDTO {
  orderId: number;
  newStatus: OrderStatus
}
