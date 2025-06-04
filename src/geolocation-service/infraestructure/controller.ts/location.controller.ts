import { GetCurrentLocationService } from "../../application/getCurrentLocation.service";
import { GetLocationHistoryService } from "../../application/getLocationHistory.service";
import { SaveDeliveryLocationService } from "../../application/saveDeliveryLocation.service";
import { SaveDeliverylocationDto } from "../../domain/dto/deliveryLocation.dto";
import { Body, Controller, Get, Path, Post, Route, Tags } from "tsoa";
import { LocationRepository } from "../repository/location.respository";

@Route('location')
@Tags('Location')
export class LocationController extends Controller {
    private readonly getCurrentLocationService: GetCurrentLocationService;
    private readonly getLocationHistoryService: GetLocationHistoryService;
    private readonly saveDeliveryLocationService: SaveDeliveryLocationService;
    private readonly locationRepository = new LocationRepository;

    constructor() {
        super();
        this.getCurrentLocationService = new GetCurrentLocationService(this.locationRepository);
        this.getLocationHistoryService = new GetLocationHistoryService(this.locationRepository);
        this.saveDeliveryLocationService = new SaveDeliveryLocationService(this.locationRepository);
    }

    /**
 * Guarda la ubicación actual de un repartidor.
 * @param body Datos de ubicación a guardar.
 * @returns Indica si la operación fue exitosa.
 */
    @Post('update')
    public async updateLocation(@Body() body: SaveDeliverylocationDto): Promise<{ success: boolean }> {
        await this.saveDeliveryLocationService.saveDeliveryLocation(body);
        return { success: true };
    }


  /**
   * Obtiene la última ubicación conocida de un repartidor.
   * @param deliveryId ID del repartidor.
   * @returns Ubicación actual del repartidor.
   */
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

      /**
   * Obtiene el historial de ubicaciones de un repartidor entre dos fechas.
   * @param deliveryId ID del repartidor.
   * @param from Fecha de inicio (ISO).
   * @param to Fecha de fin (ISO).
   * @returns Lista de ubicaciones.
   */
    @Get('{deliveryId}/history/{from}/{to}')
    async getLocationHistory(
        @Path() deliveryId: string,
        @Path() from: Date,
        @Path() to: Date
    ): Promise<{ lat: number; lng: number; timestamp: Date }[]> {
        const history = await this.getLocationHistoryService.getLocationHistory(deliveryId, from, to);

        if (!history || history.length === 0) {
            this.setStatus(404);
            return Promise.reject({ message: 'No location history found' });
        }

        return history;
    }
}