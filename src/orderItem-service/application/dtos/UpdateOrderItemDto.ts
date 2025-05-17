export interface UpdateOrderItemDto {
    /**
     * @IsNotEmpty Order ID cannot be empty
     * @minimum 1 Order ID cannot be empty
     */
    id: number;

    /**
     * @minimum 1 Quantity must be at least 1
     */
    quantity: number;
  
    /**
     * @minimum 0 Unit price cannot be negative
     */
    unitPrice: number;
  }
  