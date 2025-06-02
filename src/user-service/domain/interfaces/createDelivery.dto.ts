
export class CreateDeliveryDTO {
    fullname!: string;
    email!: string;
    phone!: string;
    current_password!: string;
    storeId!: StoreDTO;
}

export class StoreDTO {
    id_almacen!: string;
    name!: string;
    address!: string;
    capacity!: number;
    cityId!: number;
    id!: number;
    latitude!: number;
    longitude!: number;
    status!: string;
    userId?: string; // Optional, as it may not be set initially
    zipCode?: number; // Optional, as it may not be set initially
}
