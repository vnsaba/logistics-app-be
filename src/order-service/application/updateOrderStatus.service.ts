import { UpdateOrderStatusDTO } from '../domain/Dto/UpdateOrderStatus.dto';
import { IOrderRepository } from '../domain/interface/order.interface';
import { OrderStatus } from '../../shared/enums/orderStatus.enum';

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELED],
    [OrderStatus.IN_PROGRESS]: [OrderStatus.ONTHEWAY, OrderStatus.CANCELED],
    [OrderStatus.ONTHEWAY]: [OrderStatus.DELIVERED, OrderStatus.CANCELED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELED]: [],
};


export class UpdateOrderStatusService {
    constructor(private readonly repository: IOrderRepository) { }

    async execute({ orderId, newStatus }: UpdateOrderStatusDTO): Promise<void> {
        const order = await this.repository.findById(orderId);
        if (!order) throw new Error('Order not found');

        const currentStatus = order.status as OrderStatus;

        if (!validTransitions[currentStatus].includes(newStatus as OrderStatus)) {
            throw new Error(`Invalid transition from ${currentStatus} to ${newStatus}`);
        }

        await this.repository.updateStatus(orderId, newStatus as OrderStatus);
        await this.repository.addEvent(orderId, newStatus as OrderStatus);
    }
}
