import { Order } from "../entity/order";
import { UpdateOrderDto } from "../Dto/updateOrder.dto";
import { CreateOrderDto } from "../Dto/createOrder.dto";
import { OrderResponseDTO } from "../Dto/orderResponse.dto";
import { OrderStatus } from "prisma/generated/mysql";
import { EnrichedOrder } from "../../../shared/domain/interfaces/enrichedOrder.interface";

export interface IOrderRepository {
  create(order: CreateOrderDto): Promise<CreateOrderDto>;
  findById(id: number): Promise<Order | null>;
  getAllWithRelations(): Promise<OrderResponseDTO[]>;
  getByIdWithRelations(id: number): Promise<OrderResponseDTO | null>;
  update(id: number, order: UpdateOrderDto): Promise<{ message: string }>;
  updateStatus(id: number, status: OrderStatus): Promise<{ message: string }>;
  addEvent(orderId: number, status: string): Promise<void>;
  findByDeliveryAndDate(
    deliveryId: string,
    startDate: Date,
    endDate: Date
  ): Promise<EnrichedOrder[] | null>;

  // updateStatus(id:number, status:OrderStatus): Promise<Order>;
  // findByClientId(clientId: string): Promise<Order[]>
  // findByOrder(id: number): Promise<Order>
}
