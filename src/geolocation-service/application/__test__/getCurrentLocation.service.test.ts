import { GetCurrentLocationService } from '../getCurrentLocation.service';
import { IlocationRepository } from '../../domain/interface/Location.interface';

describe('GetCurrentLocationService', () => {
  let service: GetCurrentLocationService;
  let repository: jest.Mocked<IlocationRepository>;

  beforeEach(() => {
    repository = {
      getLocationHistory: jest.fn(),
      saveLocation: jest.fn(),
      getCurrentLocation: jest.fn(),
    };
    service = new GetCurrentLocationService(repository);
  });

  it('debe retornar la ubicación actual de un delivery', async () => {
    const mockLocation = {
      deliveryId: 'abc123',
      latitude: 4.711,
      longitude: -74.072,
      timestamp: '2025-06-01T12:00:00Z',
    };

    repository.getCurrentLocation.mockResolvedValue(mockLocation);

    const result = await service.getCurrentLocation('abc123');

    expect(result).toEqual(mockLocation);
    expect(repository.getCurrentLocation).toHaveBeenCalledWith('abc123');
  });
});
