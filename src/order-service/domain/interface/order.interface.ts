import { Order } from "../entity/order";
import { UpdateOrderDto } from "../Dto/updateOrder.dto";
// import { CreateOrderDto } from "../Dto/createOrder.dto";
import { OrderResponseDTO } from "../Dto/orderResponse.dto";
import { OrderStatus } from "prisma/generated/mysql";
import { OrderDetailResponseDTO } from "../Dto/orderDetail.dto";
import { EnrichedOrder } from "../../../shared/domain/interfaces/enrichedOrder.interface";

export interface IOrderRepository {
  create(order: CreateOrderDto): Promise<CreateOrderDto>;
  findById(id: number): Promise<Order | null>;
  getAllWithRelations(): Promise<OrderResponseDTO[]>;
  getByIdWithRelations(id: number): Promise<OrderDetailResponseDTO | null>;
  update(id: number, order: UpdateOrderDto): Promise<{ message: string }>;
  updateStatus(id: number, status: OrderStatus): Promise<{ message: string }>
  addEvent(orderId: number, status: string): Promise<void>;
  getOrdersByCustomerId(customerId: string): Promise<OrderResponseDTO[]>; // Get orders by customer ID
  getOrdersByCourierId(courierId: string): Promise<OrderResponseDTO[]>; // Get orders assigned to a specific courier
  create(order: CreateOrderDto): Promise<CreateOrderDto>;
  findById(id: number): Promise<Order | null>;
  getAllWithRelations(): Promise<OrderResponseDTO[]>;
  getByIdWithRelations(id: number): Promise<OrderDetailResponseDTO | null>;
  update(id: number, order: UpdateOrderDto): Promise<{ message: string }>;
  updateStatus(id: number, status: OrderStatus): Promise<{ message: string }>;
  addEvent(orderId: number, status: string): Promise<void>;
  findByDeliveryAndDate(
    deliveryId: string,
    startDate: Date,
    endDate: Date
  ): Promise<EnrichedOrder[] | null>;
}
