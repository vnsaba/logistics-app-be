import {User} from "../../../user-service/domain/entity/user";
import {Product} from "../../../product-service/domain/entity/product";
import {OrderStatus} from "../../../shared/enums/orderStatus.enum";
import {Store} from "../../../store-service/domain/entity/store";

export interface OrderInfoDto {
    id: number;
    User: User;
    subtotal: number;
    createAt: Date;
    Products: Product[];
    status: OrderStatus;
    address: string;
    latitude: number;
    longitude: number;
    store: Store;
    courier: User;
}