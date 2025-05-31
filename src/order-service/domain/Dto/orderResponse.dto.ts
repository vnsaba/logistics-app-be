export class OrderResponseDTO {
  id!: number;
  user!: {
    id: string;
    fullName: string;
  };
  subtotal!: number;
  createdAt!: string;
  deliveryDate!: string | null;
  products!: {
    id: number;
    name: string;
    isActive: boolean;
    description: string;
    images: ImageDTO[];
    createdAt: string;
    unitPrice: number;
    category: number;
  }[];
  status!: {
    id: number;
    text: string;
  };
  address!: {
    text: string;
    latitude: number | null;
    longitude: number | null;
  }
  store!: {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    address: {
      "text": string;
      "latitude": number | null;
      "longitude": number | null;
    }
  };
  courier!: {
    id: string;
    name: string;
    gender: string;
    gsm: string;
    createdAt: string;
    accountNumber: string;
    address: {
      text: string;
      latitude: number | null;
      longitude: number | null;
    }; status: {
      id: number;
      text: string;
    };
  } | null;
  events!: {
    date: Date | null; // ← Ya no opcional si siempre lo estás retornando
    status: string;
  }[];
  orderNumber!: number;
}


// image.dto.ts
export class ImageDTO {
  url!: string;
  name!: string;
}
