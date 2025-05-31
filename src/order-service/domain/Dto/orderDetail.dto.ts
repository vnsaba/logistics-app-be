export interface OrderDetailDTO {
    id: number;
    orderNumber: number;
    createdAt: Date;
    subtotal: number;
    user: {
        id: number;
        fullName: string;
        phone: string;
        createdAt: Date;
        isActive: boolean;
    };
    products: {
        id: number;
        name: string;
        description: string;
        isActive: boolean;
        createdAt: Date;
        price: number;
        category: { id: number };
    }[];
    status: {
        id: number;
        text: string;
    };
    store: {
        id: number;
        name: string;
        isActive: boolean;
        createdAt: Date;
    };
    courier: {
        id: number;
        name: string;
        email: string;
        gsm: string;
        createdAt: Date;
        accountNumber: string;
        licensePlate: string;
        address: {
            text: string;
            latitude: number;
            longitude: number;
        };
        status: {
            id: number;
            text: string;
        };
    };
    events: {
        status: string;
        date?: Date;
    }[];
}
