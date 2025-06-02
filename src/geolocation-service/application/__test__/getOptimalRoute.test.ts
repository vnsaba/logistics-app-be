import { RouteController } from '../../infraestructure/route.controller';

jest.mock('@googlemaps/google-maps-services-js', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      directions: jest.fn(),
    })),
    TravelMode: { driving: 'driving' },
  };
});

describe('RouteController', () => {
  let controller: RouteController;
  let mockClient: any;

  beforeEach(() => {
    controller = new RouteController();
    mockClient = (controller as any).client;
  });

  it('debe retornar la ruta óptima desde Google Maps Directions API', async () => {
    const mockResponse = {
      data: {
        status: 'OK',
        routes: [
          {
            summary: 'Av. Principal',
            overview_polyline: { points: 'abc123' },
            legs: [
              {
                distance: { text: '12 km', value: 12000 },
                duration: { text: '15 mins', value: 900 },
              },
            ],
          },
        ],
      },
    };

    mockClient.directions.mockResolvedValue(mockResponse);

    const result = await controller.getOptimalRoute('Bogotá', 'Medellín');

    expect(result).toEqual({
      summary: 'Av. Principal',
      distance: { text: '12 km', value: 12000 },
      duration: { text: '15 mins', value: 900 },
      polyline: 'abc123',
    });

    expect(mockClient.directions).toHaveBeenCalledWith({
      params: {
        origin: 'Bogotá',
        destination: 'Medellín',
        mode: 'driving',
        key: process.env.GEOCODING_API || '',
      },
    });
  });
});
