import { DeliverylocationDto } from "../domain/dto/deliveryLocation.dto";
import { IlocationRepository } from "../domain/interface/Location.interface";

export class GetLocationHistoryService {
    constructor(private readonly locationRepository: IlocationRepository) {}

    async getLocationHistory(riderId: string, from: Date, to: Date): Promise<DeliverylocationDto[]> {
        return await this.locationRepository.getLocationHistory(riderId, from, to);
    }
}