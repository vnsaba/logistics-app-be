export class OrderResponseDTO {
  id!: number;
  user!: {
    id: string;
    fullName: string;
  };
  subtotal!: number;
  createdAt!: string;
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
  store!: {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    address: {
      "text": string;
      "latitude": number;
      "longitude": number;
    }
  };
  courier!: {
    id: string;
    name: string;
    gender: string;
    gsm: string;
    createdAt: string;
    accountNumber: string;
    address: string;
    status: {
      id: number;
      text: string;
    };
  } | null;
  events!: {
    date: Date; // ← Ya no opcional si siempre lo estás retornando
    status: string;
  }[];
  orderNumber!: number;
}


// image.dto.ts
export class ImageDTO {
  url!: string;
  name!: string;
}
