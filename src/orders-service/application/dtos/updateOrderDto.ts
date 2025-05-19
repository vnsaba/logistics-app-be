import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsLatitude, IsLongitude } from 'class-validator';
import { OrderStatus } from '../../../shared/enums/orderStatus.enum';
// export class UpdateOrderDto {
//   @IsEnum(OrderStatus, { message: 'Status must be a valid OrderStatus' })
//   @IsNotEmpty({ message: 'Status cannot be empty' })
//   status!: 'PENDING' | 'IN_PROGRESS' | 'CANCELED' | 'COMPLETED';

//   @IsString({ message: 'Delivery ID must be a string' })
//   @IsNotEmpty({ message: 'Delivery ID cannot be empty' })
//   deliveryId!: string;

//   @IsNumber({}, { message: 'Total amount must be a number' })
//   @IsNotEmpty({ message: 'Total amount cannot be empty' })
//   totalAmount!: number;

//   @IsString({ message: 'Address must be a string' })
//   @IsNotEmpty({ message: 'Address cannot be empty' })
//   address!: string;

//   @IsOptional()
//   @IsLatitude({ message: 'Latitude must be a valid coordinate' })
//   latitude?: number;

//   @IsOptional()
//   @IsLongitude({ message: 'Longitude must be a valid coordinate' })
//   longitude?: number;
// }


export class UpdateOrderDto {
  address?: string;
  latitude?: number;
  longitude?: number;
  status?: OrderStatus; // PENDING, CANCELED, etc.
  totalAmount?: number;
  subOrders?: {
    id: number;
    status?: OrderStatus;
    deliveryId?: string;
  }[];
}
