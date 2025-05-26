import {
  Controller,
  Route,
  Tags,
  Post,
  Body,
  Get,
  Path
} from 'tsoa';
import { redisService } from '../../shared/infraestructure/redis';
import { LocationUpdateRequest } from '../domain/interface/LocationUpdate.interface';

@Route('location')
@Tags('Location')
export class LocationController extends Controller {

  @Post('update')
  public async updateLocation(@Body() body: LocationUpdateRequest): Promise<{ success: boolean }> {
    await redisService.setLocation(body.deliveryId, body.latitude, body.longitude);
    return { success: true };
  }

  @Get('{deliveryId}/current')
  public async getCurrentLocation(@Path() deliveryId: string): Promise<{ latitude: number, longitude: number, timestamp: number }> {
    const location = await redisService.getLocation(deliveryId);
    if (!location) {
      this.setStatus(404);
      return Promise.reject({ message: 'Location not found' });
    }
    return location;
  }
}
