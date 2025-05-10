import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsLatitude, IsLongitude, Min } from 'class-validator';

enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
  CANCELED = 'CANCELED'
}

export class UpdateOrderDto {
  @IsEnum(OrderStatus, { message: 'Status must be a valid OrderStatus' })
  @IsNotEmpty({ message: 'Status cannot be empty' })
  status!: 'PENDING' | 'IN_PROGRESS' | 'CANCELED' | 'COMPLETED';

  @IsString({ message: 'Delivery ID must be a string' })
  @IsNotEmpty({ message: 'Delivery ID cannot be empty' })
  deliveryId!: string;

  @IsNumber({}, { message: 'Total amount must be a number' })
  @IsNotEmpty({ message: 'Total amount cannot be empty' })
  totalAmount!: number;

  @IsString({ message: 'Address must be a string' })
  @IsNotEmpty({ message: 'Address cannot be empty' })
  address!: string;

  @IsOptional()
  @IsLatitude({ message: 'Latitude must be a valid coordinate' })
  latitude?: number;

  @IsOptional()
  @IsLongitude({ message: 'Longitude must be a valid coordinate' })
  longitude?: number;
}
