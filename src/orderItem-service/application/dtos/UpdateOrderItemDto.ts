export interface UpdateOrderItemDto {
    /**
     * @isInt Must be an integer
     * @IsNotEmpty Order ID cannot be empty
     * @minimum 1 Order ID cannot be empty
     */
    id: number;

    /**
     * @isInt Must be an integer
     * @minimum 1 Quantity must be at least 1
     */
    quantity: number;
  
    /**
     * @isInt Must be an integer
     * @minimum 0 Unit price cannot be negative
     */
    unitPrice: number;
  }
  