import { GetCurrentLocationService } from "../../application/getCurrentLocation.service";
import { GetLocationHistoryService } from "../../application/getLocationHistory.service";
import { SaveDeliveryLocationService } from "../../application/saveDeliveryLocation.service";
import { DeliverylocationDto, SaveDeliverylocationDto } from "../../domain/dto/deliveryLocation.dto";
import { Body, Controller, Get, Path, Post, Route, Tags } from "tsoa";
import { LocationRepository } from "../repository/location.respository";

@Route('location')
@Tags('Location')
export class LocationController extends Controller {
    private readonly getCurrentLocationService: GetCurrentLocationService;
    private readonly getLocationHistoryService: GetLocationHistoryService;
    private readonly saveDeliveryLocationService: SaveDeliveryLocationService;
    private readonly locationRepository = new LocationRepository;
    
    constructor(){
        super();
        this.getCurrentLocationService = new GetCurrentLocationService(this.locationRepository);
        this.getLocationHistoryService = new GetLocationHistoryService(this.locationRepository);
        this.saveDeliveryLocationService = new SaveDeliveryLocationService(this.locationRepository);
    }

    @Post('update')
    public async updateLocation(@Body() body: SaveDeliverylocationDto): Promise<{ success: boolean }> {
        await this.saveDeliveryLocationService.saveDeliveryLocation(body);
        // await redisService.setLocation(body.deliveryId, body.latitude, body.longitude);
        return { success: true };
    }

    @Get('{deliveryId}/current')
    public async getCurrentLocation(@Path() deliveryId: string): Promise<{ latitude: number, longitude: number, timestamp: number }> {
        const location = await this.getCurrentLocationService.getCurrentLocation(deliveryId);
        if (!location) {
            this.setStatus(404);
            return Promise.reject({ message: 'Location not found' });
        }
        return {
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: typeof location.timestamp === 'string' ? Number(location.timestamp) : location.timestamp
        };
    }

    @Get('{deliveryId}/history/{from}/{to}')
    async getLocationHistory(
        @Path() deliveryId: string,
        @Path() from: Date,
        @Path() to: Date
    ): Promise<DeliverylocationDto[]> {
        const history = await this.getLocationHistoryService.getLocationHistory(deliveryId, from, to);
        if (!history || history.length === 0) {
            this.setStatus(404);
            return Promise.reject({ message: 'No location history found' });
        }
        return history;
    }

}