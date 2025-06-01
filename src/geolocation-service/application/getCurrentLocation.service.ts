import { DeliverylocationDto } from "../domain/dto/deliveryLocation.dto";
import { IlocationRepository } from "../domain/interface/Location.interface";

export class GetCurrentLocationService {
    constructor(private readonly locationRepository: IlocationRepository) {}

    async getCurrentLocation(deliveryId: string): Promise<DeliverylocationDto | null> {
        return await this.locationRepository.getCurrentLocation(deliveryId);
    }
}