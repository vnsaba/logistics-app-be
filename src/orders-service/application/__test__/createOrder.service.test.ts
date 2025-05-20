// __tests__/create-order.service.spec.ts
import { CreateOrderService } from '../createOrders.ervice';
import { OrderStatus } from '../../../shared/enums/orderStatus.enum';

const mockOrderRepository = {
    create: jest.fn(),
};

const mockStoreRepository = {
    findById: jest.fn(),
};

const mockProductRepository = {
    findById: jest.fn(),
};

const mockGeocodingService = {
    geocode: jest.fn(),
};

const mockUserRepository = {
    findByClientId: jest.fn(),
    getAllDeliveries: jest.fn(),
};

const mockDistanceService = {
    getDistancesFromGoogle: jest.fn(),
};

const mockInventoryRepository = {
    findByProductAndStore: jest.fn(),
    update: jest.fn(),
    getStoreAndProductExist: jest.fn(),
};
mockInventoryRepository.getStoreAndProductExist.mockResolvedValue({
    id: 100,
    availableQuantity: 10,
});
const createOrderService = new CreateOrderService(
    mockOrderRepository as any,
    mockStoreRepository as any,
    mockProductRepository as any,
    mockGeocodingService as any,
    mockUserRepository as any,
    mockDistanceService as any,
    mockInventoryRepository as any
);

describe('CreateOrderService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('crea un pedido exitosamente', async () => {
        // Mocks necesarios
        mockGeocodingService.geocode.mockResolvedValue({ latitude: 4.7, longitude: -74.0 });
        mockUserRepository.findByClientId.mockResolvedValue({ id: 'cliente123' });

        mockStoreRepository.findById.mockResolvedValue({ id: 1, latitude: 4.7, longitude: -74.0 });
        mockProductRepository.findById.mockResolvedValue({ id: 10 });
        mockInventoryRepository.findByProductAndStore.mockResolvedValue({
            id: 100,
            availableQuantity: 10,
        });
        mockInventoryRepository.update.mockResolvedValue(true);

        mockUserRepository.getAllDeliveries.mockResolvedValue([
            { id: 'r1', latitude: 4.7, longitude: -74.1, isAvaliable: true, activeOrders: 0 },
        ]);
        mockDistanceService.getDistancesFromGoogle.mockResolvedValue([
            { deliveryId: 'r1', distance: 1000 },
        ]);
        mockOrderRepository.create.mockResolvedValue({
            id: 1,
            customerId: 'cliente123',
            status: OrderStatus.PENDING,
        });

        const mockRequest = {
            customerId: 'cliente123',
            address: 'Cra. 50 #60-30, Medellín, Antioquia',
            subOrders: [
                {
                    storeId: 1,
                    orderItems: [
                        {
                            productId: 10,
                            quantity: 2,
                            unitPrice: 5,
                        },
                    ],
                },
            ],
        };

        const result = await createOrderService.createOrder(mockRequest as any);

        expect(result).toHaveProperty('id');
        expect(mockOrderRepository.create).toHaveBeenCalled();
        expect(mockInventoryRepository.update).toHaveBeenCalledWith(100, { availableQuantity: 8 });
    });
});
it('lanza error si el cliente no existe', async () => {
    mockUserRepository.findByClientId.mockResolvedValue(null);

    const mockRequest = {
        customerId: 'no-existe',
        address: 'calle 1',
        subOrders: [],
    };

    await expect(createOrderService.createOrder(mockRequest as any)).rejects.toThrow(
        'Client with id no-existe not found'
    );
});
it('lanza error si no hay repartidores disponibles', async () => {
    mockGeocodingService.geocode.mockResolvedValue({ latitude: 4.7, longitude: -74.0 });
    mockUserRepository.findByClientId.mockResolvedValue({ id: 'cliente123' });

    mockStoreRepository.findById.mockResolvedValue({ id: 1, latitude: 4.7, longitude: -74.0 });
    mockProductRepository.findById.mockResolvedValue({ id: 10 });
    mockInventoryRepository.findByProductAndStore.mockResolvedValue({
        id: 100,
        availableQuantity: 10,
    });

    mockUserRepository.getAllDeliveries.mockResolvedValue([]);

    const mockRequest = {
        customerId: 'cliente123',
        address: 'Calle falsa 123',
        subOrders: [
            {
                storeId: 1,
                orderItems: [
                    {
                        productId: 10,
                        quantity: 2,
                        unitPrice: 5,
                    },
                ],
            },
        ],
    };

    await expect(createOrderService.createOrder(mockRequest as any)).rejects.toThrow(
        'No delivery person available'
    );
});
