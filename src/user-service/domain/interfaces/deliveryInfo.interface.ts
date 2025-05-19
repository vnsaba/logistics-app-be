export interface DeliveryInfo {
  id: string;
  fullname: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
  isAvaliable: boolean | null;
  activeOrders: number | null;
}

