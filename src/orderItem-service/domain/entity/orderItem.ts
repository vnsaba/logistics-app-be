
export class OrderItem {
    constructor(
        public id: number,
        public productId: number,
        public quantity: number,
        public unitPrice: number,
        public subOrderId: number,
        public createdAt: Date,
        public updatedAt: Date
    ){}
}
