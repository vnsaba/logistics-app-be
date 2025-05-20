export interface StoreProductDto {
  storeId: number;
  storeName: string;
  storeAddress: string;
  storeLatitude: number;
  storeLongitude: number;

  productId: number;
  productName: string;
  productDescription: string;
  unitPrice: number;
  imageUrl: string;
  categoryName: string;
  categoryIdd: number;

  availableQuantity: number;
}

