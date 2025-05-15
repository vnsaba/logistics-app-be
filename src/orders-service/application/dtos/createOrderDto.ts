import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, Min } from 'class-validator';
import { IsEnum, IsString, IsNumber, IsLatitude, IsLongitude } from 'class-validator';
// import { OrderItem } from '../../../orderItem-service/domain/entity/orderItem';
import { OrderStatus } from "../../../shared/enums/orderStatus.enum";
import { CreateOrderItemDto } from '../../../orderItem-service/application/dtos/createOrderItemDto';

export class CreateOrderDto {
    @IsNotEmpty({ message: 'Store ID is required' })
    storeId!: number;

    @IsNotEmpty({ message: 'Delivery ID is required' })
    @IsString({ message: 'Delivery ID must be a string' })
    deliveryId!: string;

    @IsNotEmpty({ message: 'Customer ID is required' })
    @IsString({ message: 'Customer ID must be a string' })
    customerId!: string;

    @IsEnum(OrderStatus, { message: 'Invalid order status' })
    status!: OrderStatus;

    @IsNumber({}, { message: 'Total amount must be a number' })
    @IsNotEmpty({ message: 'Total amount is required' })
    @IsInt({ message: 'Total amount must be an integer' })
    @Min(0, { message: 'Total amount must be at least 0' })
    totalAmount!: number;

    @IsLatitude({ message: 'Latitude must be a valid coordinate' })
    @IsNotEmpty({ message: 'Latitude is required' })
    latitude!: number;

    @IsLongitude({ message: 'Longitude must be a valid coordinate' })
    @IsNotEmpty({ message: 'Longitude is required' })
    longitude!: number;

    @IsString({ message: 'Address must be a string' })
    @IsNotEmpty({ message: 'Address is required' })
    address!: string;

    @IsArray({ message: 'Items must be an array' })
    @ArrayMinSize(1, { message: 'At least one item is required' })
    items!: CreateOrderItemDto[];
}

