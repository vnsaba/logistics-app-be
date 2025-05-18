export interface CreateStoreDto {
  name: string;
  address: string;
  cityId: number;
  capacity: number;
  latitude: number;
  longitude: number;
  zipCode: string;
  status?: "ACTIVE" | "INACTIVE"; 
}
