import { updateOrderService } from '../../application/updateOrder.service';
import { OrderStatus } from '../../../shared/enums/orderStatus.enum';

describe('updateOrderService', () => {
  let mockOrderRepository: any;
  let mockSubOrderRepository: any;
  let mockGeocodingService: any;
  let mockOrderItemRepository: any;
  let mockUserRepository: any;
  let mockInventoryRepository: any;
  let service: updateOrderService;

  beforeEach(() => {
    mockOrderRepository = {
      findById: jest.fn(),
      findByOrder: jest.fn(),
      update: jest.fn()
    };

    mockSubOrderRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      updateSubOrder: jest.fn()
    };

    mockGeocodingService = {
      geocode: jest.fn()
    };

    mockOrderItemRepository = {
      findById: jest.fn(),
      update: jest.fn()
    };

    mockUserRepository = {
      findById: jest.fn(),
      updateActiveOrders: jest.fn()
    };

    mockInventoryRepository = {
      getStoreAndProductExist: jest.fn(),
      update: jest.fn()
    };

    service = new updateOrderService(
      mockOrderRepository,
      mockSubOrderRepository,
      mockGeocodingService,
      mockOrderItemRepository,
      mockUserRepository,
      mockInventoryRepository
    );
  });

  it('debería actualizar dirección de una orden con estado PENDING', async () => {
    mockOrderRepository.findById.mockResolvedValue({ id: 1, status: OrderStatus.PENDING });
    mockGeocodingService.geocode.mockResolvedValue({ latitude: 1.23, longitude: 4.56 });

    await service.updateOrder(1, "Nueva dirección");

    expect(mockOrderRepository.update).toHaveBeenCalledWith(1, {
      address: "Nueva dirección",
      latitude: 1.23,
      longitude: 4.56
    });
  });

  it('debería lanzar error si no encuentra suborden en updateSubOrder', async () => {
    mockSubOrderRepository.findById.mockResolvedValue(null);
    await expect(service.updateSubOrder("delivery123", 1)).rejects.toThrow("SubOrder not found");
  });

  it('debería actualizar un OrderItem y el inventario correctamente', async () => {
    const mockOrderItem = {
      id: 10,
      quantity: 2,
      unitPrice: 100,
      productId: 5,
      subOrderId: 20,
      createdAt: new Date()
    };

    const mockSubOrder = {
      id: 20,
      status: OrderStatus.PENDING,
      storeId: 3,
      subTotal: 200,
      orderId: 1
    };

    const mockOrder = {
      id: 1,
      totalAmount: 200
    };

    const mockInventory = {
      id: 15,
      availableQuantity: 5
    };

    mockOrderItemRepository.findById.mockResolvedValue(mockOrderItem);
    mockSubOrderRepository.findById.mockResolvedValue(mockSubOrder);
    mockOrderRepository.findByOrder.mockResolvedValue(mockOrder);
    mockInventoryRepository.getStoreAndProductExist.mockResolvedValue(mockInventory);

    await service.updateOrderItem(10, 3); // aumentar cantidad de 2 a 3

    expect(mockInventoryRepository.update).toHaveBeenCalledWith(15, { availableQuantity: 4 });
    expect(mockOrderItemRepository.update).toHaveBeenCalledWith(expect.objectContaining({ quantity: 3 }));
    expect(mockSubOrderRepository.updateSubOrder).toHaveBeenCalledWith(20, 300);
    expect(mockOrderRepository.update).toHaveBeenCalledWith(1, { totalAmount: 300 });
  });
});
