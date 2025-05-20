import { CancelSubOrderService } from '../cancelSubOrder.service';
import { OrderStatus } from '../../../shared/enums/orderStatus.enum';

const mockOrderRepository = {
    findById: jest.fn(),
    updateStatus: jest.fn(),
};

const mockUserRepository = {
    findById: jest.fn(),
    updateActiveOrders: jest.fn(),
};

const mockSubOrdersRepository = {
    findByIdWithItems: jest.fn(),
    updateStatus: jest.fn(),
};

const mockInventoryRepository = {
    findByProductAndStore: jest.fn(),
    update: jest.fn(),
};

describe('CancelSubOrderService', () => {
    let service: CancelSubOrderService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new CancelSubOrderService(
            mockOrderRepository as any,
            mockUserRepository as any,
            mockSubOrdersRepository as any,
            mockInventoryRepository as any
        );
    });

    it('debe lanzar error si la suborden no existe', async () => {
        mockSubOrdersRepository.findByIdWithItems.mockResolvedValue(null);

        await expect(service.cancelSubOrder(1)).rejects.toThrow("SubOrder not found");
    });

    it('debe devolver mensaje si la suborden ya está cancelada', async () => {
        const subOrder = {
            id: 1,
            status: OrderStatus.CANCELED,
            orderId: 100,
        };
        mockSubOrdersRepository.findByIdWithItems.mockResolvedValue(subOrder);

        const result = await service.cancelSubOrder(1);

        expect(result).toEqual({
            message: "Suborder already canceled",
            subOrderId: 1,
            status: OrderStatus.CANCELED,
        });
    });

    it('debe cancelar la suborden y actualizar inventario y repartidor', async () => {
        const subOrder = {
            id: 1,
            storeId: 10,
            orderId: 100,
            deliveryId: "abc123",
            status: OrderStatus.PENDING,
            orderItems: [
                { productId: 200, quantity: 2 },
            ],
        };

        const deliveryUser = {
            id: "abc123",
            activeOrders: 2,
        };

        const inventory = {
            id: 300,
            availableQuantity: 5,
        };

        const order = {
            id: 100,
            status: OrderStatus.PENDING,
        };

        mockSubOrdersRepository.findByIdWithItems.mockResolvedValue(subOrder);
        mockInventoryRepository.findByProductAndStore.mockResolvedValue(inventory);
        mockUserRepository.findById.mockResolvedValue(deliveryUser);
        mockOrderRepository.findById.mockResolvedValue(order);

        const result = await service.cancelSubOrder(1);

        expect(mockSubOrdersRepository.updateStatus).toHaveBeenCalledWith(1, OrderStatus.CANCELED);
        expect(mockInventoryRepository.update).toHaveBeenCalledWith(300, { availableQuantity: 7 });
        expect(mockUserRepository.updateActiveOrders).toHaveBeenCalledWith("abc123", 1);
        expect(result).toEqual({
            message: "Suborder canceled successfully",
            subOrderId: 1,
            status: OrderStatus.CANCELED,
        });
    });
});
