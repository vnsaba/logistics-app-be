
export class Order {

    constructor(
        public id: number,
        public customerId: number,
        public storeId: number,
        public deliveryId: string,
        public status: 'PENDING',
        public totalAmount: number,
        public langitude: number,
        public longitude: number,
        public address: string,
        public creaded_at: Date,
        public update_at: Date,
    ) { }
}