import { DeliverylocationDto } from "../domain/dto/deliveryLocation.dto";
import { IlocationRepository } from "../domain/interface/Location.interface";

export class GetLocationHistoryService {
    constructor(private readonly locationRepository: IlocationRepository) {}

    async getLocationHistory(
        riderId: string,
        from: Date,
        to: Date
    ): Promise<{ lat: number; lng: number; timestamp: Date }[]> {
        const history = await this.locationRepository.getLocationHistory(riderId, from, to);

        // Transformamos cada punto al formato requerido por Google Maps
        return history.map(point => ({
            lat: point.latitude,
            lng: point.longitude,
            timestamp: new Date(point.timestamp),
        }));
    }
}
