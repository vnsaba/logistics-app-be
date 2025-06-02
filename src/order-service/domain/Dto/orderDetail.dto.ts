export interface CategoryDTO {
    id: number;
    name: string;
}

export interface ProductDTO {
    id: number;
    name: string;
    description?: string;

    imageUrl?: string;
    category: CategoryDTO;
    status: string;
    createdAt: Date;
}

export interface orderItemDTO {
    id: number;
    quantity: number;
    unitPrice: number;
    product: ProductDTO;
}

export interface DepartmentDTO {
    id: number;
    name: string;
}

export interface CityDTO {
    id: number;
    name: string;
    department: DepartmentDTO;
}

export interface StoreDTO {
    id: number;
    name: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
    status: string;
    createdAt: Date;
}

export interface OrderEventDTO {
    id: number;
    date?: Date | null;
    status: string;
}

export interface OrderStatusDTO {
    id: number;
    text: string;
}

export interface OrderDetailResponseDTO {
    id: number;
    customerId: string;
    deliveryId?: string | null;
    subTotal: number;
    createdAt: Date;
    deliveryDate?: Date | null;
    status: OrderStatusDTO;
    address: string;
    latitude?: number | null;
    longitude?: number | null;

    orderItems: orderItemDTO[];
    city: CityDTO;
    store: StoreDTO;
    events: OrderEventDTO[];
}
