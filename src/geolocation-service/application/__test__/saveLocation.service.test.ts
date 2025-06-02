import { SaveDeliverylocationDto } from '../../domain/dto/deliveryLocation.dto';
import { SaveDeliveryLocationService } from '../saveDeliveryLocation.service'; 
import { IlocationRepository } from '../../domain/interface/Location.interface';


// Validar que se guarden coordenadas correctamente (saveLocation)

describe('SaveDeliveryLocationService', () => {
  let service: SaveDeliveryLocationService;
  let repository: jest.Mocked<IlocationRepository>;

  beforeEach(() => {
    repository = {
      saveLocation: jest.fn(),
      getCurrentLocation: jest.fn(),
      getLocationHistory: jest.fn(),
    };
    service = new SaveDeliveryLocationService(repository);
  });

  it('debe guardar coordenadas correctamente', async () => {
    const locationData: SaveDeliverylocationDto = {
      deliveryId: 'abc123',
      latitude: 4.711,
      longitude: -74.072,
    };

    await service.saveDeliveryLocation(locationData);

    expect(repository.saveLocation).toHaveBeenCalledWith(locationData);
    expect(repository.saveLocation).toHaveBeenCalledTimes(1);
  });
});
