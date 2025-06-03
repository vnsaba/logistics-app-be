import { CreateOrderService } from '../createOrder.service';
import { IOrderRepository } from '../../domain/interface/order.interface';
import { IStoreRepository } from '../../../store-service/domain/interfaces/store.interface';
import { IUserRepository } from '../../../user-service/domain/interfaces/user.interface';
import { IInventoryRepository } from '../../..//inventory-service/domain/interfaces/inventory.interface';
import { GeocodingService } from '../../../geolocation-service/domain/interface/geocoding.interface';
import { IDistanceService } from '../../../geolocation-service/domain/interface/distance.interface';
import { IlocationRepository } from '../../../geolocation-service/domain/interface/Location.interface';
import { OrderStatus } from '../../../shared/enums/orderStatus.enum';

describe('CreateOrderService - Integration', () => {
  let service: CreateOrderService;

  // mocks
  const mockOrderRepo: IOrderRepository = {
    create: jest.fn().mockImplementation((order) => ({ ...order, id: 1 })),
  } as any;

  const mockStoreRepo: IStoreRepository = {
    findById: jest.fn().mockResolvedValue({ id: 1, latitude: 10, longitude: 20 }),
  } as any;

  const mockUserRepo: IUserRepository = {
    findByClientId: jest.fn().mockResolvedValue({ id: 'client1', ordersToday: 0 }),
    findByDeliveries: jest.fn().mockResolvedValue([{ id: 'd1', ordersToday: 2 }]),
    updateOrdersToday: jest.fn(),
  } as any;

  const mockInventoryRepo: IInventoryRepository = {
    findByStoreAndProduct: jest.fn().mockResolvedValue({ availableQuantity: 10 }),
    updateQuantity: jest.fn(),
  } as any;

  const mockGeocodingService: GeocodingService = {
    geocode: jest.fn().mockResolvedValue({ latitude: 5, longitude: 5 }),
    reverseGeocode: jest.fn(),
  };

  const mockDistanceService: IDistanceService = {
    getDistancesFromGoogle: jest.fn().mockResolvedValue([
      { deliveryId: 'd1', distance: 100 },
    ]),
  };

  const mockLocationRepo: IlocationRepository = {
    getCurrentLocation: jest.fn().mockResolvedValue({ latitude: 5, longitude: 5 }),
    saveLocation: jest.fn(),
    getLocationHistory: jest.fn().mockResolvedValue([]),
  };

  beforeEach(() => {
    service = new CreateOrderService(
      mockOrderRepo,
      mockStoreRepo,
      mockGeocodingService,
      mockUserRepo,
      mockDistanceService,
      mockInventoryRepo,
      mockLocationRepo
    );
  });

  it('should create order and select nearest delivery based on location', async () => {
    const payload = {
      customerId: 'client1',
      address: 'Cra 1 #1-1',
      cityId: '1',
      suborders: [{
        storeId: 1,
        orderItems: [
          { productId: 1, quantity: 1, unitPrice: 10000 }
        ]
      }]
    };

    const result = await service.createOrders(payload);

    expect(result).toHaveLength(1);
    expect(mockGeocodingService.geocode).toHaveBeenCalledWith(payload.address);
    expect(mockLocationRepo.getCurrentLocation).toHaveBeenCalled();
    expect(mockDistanceService.getDistancesFromGoogle).toHaveBeenCalled();
    expect(result[0].status).toBe(OrderStatus.PENDING);
    expect(result[0].latitude).toBe(5);
    expect(result[0].longitude).toBe(5);
  });
});
