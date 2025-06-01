import { Controller, Get, Route, Tags, Query } from 'tsoa';
import { Client, TravelMode } from '@googlemaps/google-maps-services-js';

@Route('routes')
@Tags('Routes')
export class RouteController extends Controller {
  private readonly client = new Client({});

  @Get('optimal')
  public async getOptimalRoute(
    @Query() origin: string,
    @Query() destination: string
  ): Promise<any> {
    try {
      const response = await this.client.directions({
        params: {
          origin,            
          destination,       
          mode: TravelMode.driving, 
          key: process.env.GEOCODING_API || '',
        },
      });

      if (response.data.status !== 'OK') {
        this.setStatus(400);
        return { message: 'No route found', status: response.data.status };
      }

      return {
        summary: response.data.routes[0].summary,
        distance: response.data.routes[0].legs[0].distance,
        duration: response.data.routes[0].legs[0].duration,
        polyline: response.data.routes[0].overview_polyline.points,
      };
    } catch (error) {
      this.setStatus(500);
      return { message: 'Error calculating route', error };
    }
  }
}
