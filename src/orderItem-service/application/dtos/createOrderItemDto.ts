
export interface CreateOrderItemDto {
    /**
     * @isInt Must be an integer
     * @IsNotEmpty Order ID cannot be empty
     * @minimum 1 Order ID cannot be empty
     */
    orderId: number;
  
    /**
     * @isInt Must be an integer
     * @IsntEmpty Product ID cannot be empty
     */
    productId: number;
  
    /**
     * @isInt Must be an integer
     * @minimum 1 Quantity must be at least 1
     * @IsnotEmpty Product ID cannot be empty
     */
    quantity: number;
  
    /**
     * @isInt Must be an integer
     * @minimum 0 Unit price cannot be negative
     */
    unitPrice: number;
  }
  