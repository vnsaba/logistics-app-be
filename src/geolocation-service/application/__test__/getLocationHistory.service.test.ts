import { GetLocationHistoryService } from '../getLocationHistory.service';
import { IlocationRepository } from '../../domain/interface/Location.interface';

describe('GetLocationHistoryService', () => {
  let service: GetLocationHistoryService;
  let repository: jest.Mocked<IlocationRepository>;

  beforeEach(() => {
    repository = {
      getLocationHistory: jest.fn(),
      saveLocation: jest.fn(),
      getCurrentLocation: jest.fn(),
    };
    service = new GetLocationHistoryService(repository);
  });

  it('debe retornar coordenadas transformadas en formato Google Maps', async () => {
    const mockHistory = [
      {
        deliveryId: 'r1',
        latitude: 4.711,
        longitude: -74.072,
        timestamp: '2025-06-01T12:00:00Z',
      },
    ];

    repository.getLocationHistory.mockResolvedValue(mockHistory);

    const result = await service.getLocationHistory('r1', new Date('2025-06-01T00:00:00Z'), new Date('2025-06-01T23:59:59Z'));

    expect(result).toEqual([
      {
        lat: 4.711,
        lng: -74.072,
        timestamp: new Date('2025-06-01T12:00:00Z'),
      },
    ]);
    expect(repository.getLocationHistory).toHaveBeenCalledTimes(1);
  });
});
