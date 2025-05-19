
export class Inventory {
    constructor(
        public id: number,
        public storeId: number,
        public productId: number,
        public availableQuantity: number,
        public minimumThreshold: number,
        public lastResetDate: Date,
        public createdAt: Date,
        public updatedAt: Date
    ) { }
}
