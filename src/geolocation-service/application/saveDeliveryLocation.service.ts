import { SaveDeliverylocationDto } from "../domain/dto/deliveryLocation.dto";
import { IlocationRepository } from "../domain/interface/Location.interface";


export class SaveDeliveryLocationService {
    constructor(private readonly locationRepository: IlocationRepository) { }

    async saveDeliveryLocation(locationDelivery: SaveDeliverylocationDto): Promise<void> {
        await this.locationRepository.saveLocation(locationDelivery);
    }
}