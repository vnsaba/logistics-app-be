export interface EnrichedOrder {
  id: number;
  customerId: string;
  address: string;
  latitude: number;
  longitude: number;
  storeId: number;
  deliveryId: string;
  status: string;
  subTotal: number;
  createdAt: Date;
  updatedAt: Date;
  cityId: number;
  deliveryDate: Date;
  orderItems: {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    createdAt: Date;
    updatedAt: Date;
    product: {
      id: number;
      name: string;
      description: string;
      categoryId: number;
      unitPrice: number;
      imageUrl: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
    };
  }[];
  store: {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
  city: {
    id: number;
    name: string;
    departmentId: number;
    department: {
      id: number;
      name: string;
    };
  };
  customer: {
    id: string;
    fullname: string;
    phone: string;
    email: string;
  } | null;
  delivery: {
    id: string;
    fullname: string;
    phone: string;
    email: string;
  } | null;
}