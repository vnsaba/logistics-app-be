
export class Order {
    constructor(
        public id: number,
        public customerId: string,
        public status: 'PENDING' | 'IN_PROGRESS' | 'CANCELED' | 'COMPLETED', 
        public totalAmount: number,
        public latitude: number,
        public longitude: number,
        public address: string,
        public createdAt: Date,
        public updatedAt: Date
    ) { }

}