export interface CreateInventoryDto {
  productId: number;
  storeId: number;
  availableQuantity: number;
  minimumThreshold: number;
}
