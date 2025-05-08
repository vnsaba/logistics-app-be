
export class Order {
    constructor(
        public id: number,
        public storeId: number,
        public deliveryId: string,
        public customerId: string,
        public status: 'PENDING' | 'IN_PROFRESS' | 'CANCELED' | 'COMPLETED', // Ajustar el tipo
        public totalAmount: number,
        public latitude: number,
        public longitude: number,
        public address: string,
        public createdAt: Date,
        public updatedAt: Date
    ) { }

}