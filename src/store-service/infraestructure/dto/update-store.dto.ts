export interface UpdateStoreDto {
  name?: string;
  address?: string;
  cityId?: number;
  capacity?: number;
  latitude?: number;
  longitude?: number;
  zipCode?: number;
  status?: "ACTIVE" | "INACTIVE";
}
