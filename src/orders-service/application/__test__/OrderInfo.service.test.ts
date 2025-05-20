import { OrderInfoService } from '../orderInfo.service';
import { OrderStatus } from '../../../shared/enums/orderStatus.enum';

const mockUserRepository = {
    findById: jest.fn(),
};

const mockOrderRepository = {
    findByClientId: jest.fn(),
};

const mockSubOrderRepository = {
    findByOrderIdWithItems: jest.fn(),
};

const mockStoreRepository = {
    findById: jest.fn(),
};

const mockProductRepository = {
    findById: jest.fn(),
};

describe('OrderInfoService', () => {
    let service: OrderInfoService;

    beforeEach(() => {
        service = new OrderInfoService(
            mockSubOrderRepository as any,
            mockStoreRepository as any,
            mockProductRepository as any,
            mockUserRepository as any,
            mockOrderRepository as any
        );
        jest.clearAllMocks();
    });

    it('debería lanzar error si el usuario no existe', async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        await expect(service.getOrderInfo('client-123')).rejects.toThrow('User not found');
    });

    it('debería lanzar error si el cliente no tiene órdenes', async () => {
        mockUserRepository.findById.mockResolvedValue({ id: 'client-123' });
        mockOrderRepository.findByClientId.mockResolvedValue([]);

        await expect(service.getOrderInfo('client-123')).rejects.toThrow('No orders found for this user');
    });

    it('debería retornar información de subórdenes correctamente', async () => {
        const mockClientId = 'client-123';
        const mockOrder = { id: 1 };

        const mockSubOrders = [
            {
                id: 101,
                storeId: 10,
                deliveryId: 'delivery-1',
                status: OrderStatus.PENDING,
                subTotal: 50,
                createdAt: new Date(),
                orderItems: [
                    { productId: 100, unitPrice: 25, quantity: 2 },
                ],
            },
        ];

        const mockStore = { name: 'Tienda Central' };
        const mockProduct = { id: 100, name: 'Producto X' };
        const mockDelivery = { id: 'delivery-1', fullname: 'Juan Pérez', phone: '3001234567' };

        mockUserRepository.findById.mockResolvedValue({ id: mockClientId });
        mockOrderRepository.findByClientId.mockResolvedValue([mockOrder]);
        mockSubOrderRepository.findByOrderIdWithItems.mockResolvedValue(mockSubOrders);
        mockStoreRepository.findById.mockResolvedValue(mockStore);
        mockProductRepository.findById.mockResolvedValue(mockProduct);
        mockUserRepository.findById.mockResolvedValue(mockDelivery); // Para el delivery

        const result = await service.getOrderInfo(mockClientId);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            id: mockOrder.id,
            subOrderId: 101,
            status: OrderStatus.PENDING,
            totalAmount: 50,
            storeName: 'Tienda Central',
            createdAt: expect.any(Date),
            delivery: {
                id: 'delivery-1',
                fullName: 'Juan Pérez',
                phone: '3001234567',
            },
            products: [
                {
                    id: 100,
                    name: 'Producto X',
                    unitPrice: 25,
                    quantity: 2,
                    total: 50,
                },
            ],
        });
    });
});
