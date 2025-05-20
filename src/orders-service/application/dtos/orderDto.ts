import { ArrayMinSize, IsArray, IsNotEmpty, Min, MinLength } from 'class-validator';
import { IsEnum, IsString, IsNumber, IsLatitude, IsLongitude } from 'class-validator';
import { OrderStatus } from "../../../shared/enums/orderStatus.enum";
import { CreateOrderItemDto } from '../../../orderItem-service/application/dtos/createOrderItemDto';

export class CreateOrderRequestDto {
  @IsNotEmpty({ message: 'Customer ID is required' })
  @IsString({ message: 'Customer ID must be a string' })
  customerId!: string;

  @IsString({ message: 'Address must be a string' })
  @IsNotEmpty({ message: 'Address is required' })
  @MinLength(10, { message: 'Address is too short' })
  address!: string;

  @IsArray({ message: 'Items must be an array' })
  @ArrayMinSize(1, { message: 'At least one item is required' })
  subOrders!: SubOrderDto[];
}

export class SubOrderDto {
  storeId!: number;
  deliveryId?: string;
  status?: OrderStatus;
  subTotal?: number;
  orderItems!: CreateOrderItemDto[];
}

export class CreateOrderDto extends CreateOrderRequestDto {

  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  status!: OrderStatus;

  @IsNumber({}, { message: 'Total amount must be a number' })
  @IsNotEmpty({ message: 'Total amount is required' })
  @Min(0, { message: 'Total amount must be at least 0' })
  totalAmount!: number;

  @IsLatitude({ message: 'Latitude must be a valid coordinate' })
  @IsNotEmpty({ message: 'Latitude is required' })
  latitude!: number;

  @IsLongitude({ message: 'Longitude must be a valid coordinate' })
  @IsNotEmpty({ message: 'Longitude is required' })
  longitude!: number;

}

//utilizar para crear la orden
export interface CreateOrderResponseDto {
  customerId: string,
  address: string,
  latitude: number,
  longitude: number,
  status: OrderStatus.PENDING,
  totalAmount: number,
  subOrders: SubOrdersInterface[]
}

export interface SubOrdersInterface {
  id: number;
  orderId: number;
  storeId: number;
  deliveryId: string;
  status: OrderStatus;
  subTotal: number;
  createdAt: Date;
  orderItems: CreateOrderItemDto[];
}

export interface SubOrderInterface {
  id: number;
  orderId: number;
  storeId: number;
  deliveryId: string;
  status: OrderStatus;
  subTotal: number;
  createdAt: Date;
  orderItems: CreateOrderItemDto[];
}

export interface OrderWithSubOrdersDto {
  id: number;
  customerId: string;
  address: string;
  latitude: number;
  longitude: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  subOrders: SubOrderInterface[];
}

export interface OrderInterface {
  id: number;
  customerId: string;
  address: string;
  latitude: number;
  longitude: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  subOrders: SubOrderInterface[];
}

export interface CancelSubOrderResponse {
  message: string;
  subOrderId: number;
  status: OrderStatus;
}

export interface DeliveryInfoDto {
  id: string;
  fullName: string;
  phone: string;
}

export interface ProductOrderInfoDto {
  id: number;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number; // unitPrice * quantity
}

export interface SubOrderInfoDto {
  id?: number;
  subOrderId: number;
  status: string;
  totalAmount: number;
  storeName: string;
  createdAt: Date;
  delivery: DeliveryInfoDto;
  products: ProductOrderInfoDto[];
}

export interface OrderInfoDto {
  subOrders: SubOrderInfoDto[];
}