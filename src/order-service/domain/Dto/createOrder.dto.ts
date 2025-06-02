import { CreateOrderItemDto } from "./createOrderItemDto";
import { OrderStatus } from "../../../shared/enums/orderStatus.enum";

export interface CreateOrderDto {
    customerId: string,
    storeId: number,
    deliveryId: string,
    cityId: number,
    deliveryDate: Date,
    address: string,
    latitude: number,
    longitude: number,
    status: OrderStatus,
    subTotal: number,
    orderItems: CreateOrderItemDto[];
}


// export interface CreateOrderResponseDto {
//     customerId: string,
//     address: string,
//     storeId: number,
//     cityId: number,
//     orderItems: CreateOrderItemDto[];
// }



export interface CreateOrderResponseDto {
  customerId: string;
  address: string;
  cityId: string;
  suborders: {
    storeId: number;
    orderItems: {
      productId: number;
      quantity: number;
      unitPrice: number;
    }[];
  }[];
}
