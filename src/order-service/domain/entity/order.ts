import { OrderStatus } from "../../../shared/enums/orderStatus.enum";

export class Order {
    constructor(
        public id: number,
        public customerId: string,
        public storeId : number,
        public deliveryId: string,
        public cityId: number,
        public deliveryDate: Date,
        public status: OrderStatus, 
        public subTotal: number,
        public latitude: number,
        public longitude: number,
        public address: string,
        public createdAt: Date,
        public updatedAt: Date
    ) { }

}
