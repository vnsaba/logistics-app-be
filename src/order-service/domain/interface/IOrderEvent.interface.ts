export interface IOrderEventRepository {
    create(event: { orderId: number, status: string, date?: Date }): Promise<void>;
}
