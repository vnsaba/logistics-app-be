import { DeliverylocationDto, SaveDeliverylocationDto } from "../dto/deliveryLocation.dto";

export interface IlocationRepository {
  saveLocation(data: SaveDeliverylocationDto): Promise<void>;
  getCurrentLocation(deliveryId: string): Promise<DeliverylocationDto | null>;
  getLocationHistory(deliveryId: string, from: Date, to: Date): Promise<DeliverylocationDto[]>;
}
