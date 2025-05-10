
export class OrderItem {
    constructor(
        public id: number,
        public orderId: number,
        public productId: number,
        public quantity: number,
        public unitPrice: number,
        public createdAt: Date,
        public updatedAt: Date
    ){}
}
