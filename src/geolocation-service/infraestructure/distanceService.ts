import { IDistanceService } from "../domain/interface/distance.interface";
import axios from 'axios';

export class DistanceService implements IDistanceService {
    constructor(private readonly  apikey: string) { }
    public async getDistancesFromGoogle(
        originLat: number,
        originLng: number,
        deliveries: { id: string; latitude: number; longitude: number }[],
    ): Promise<Array<{ deliveryId: string; distance: number }>> {
        const destinations = deliveries
            .map(d => `${d.latitude},${d.longitude}`)
            .join('|');

        const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
            params: {
                origins: `${originLat},${originLng}`,
                destinations,
                key: this.apikey,
            }
        });

        const elements = response.data.rows[0].elements;
        return deliveries.map((delivery, i) => ({
            deliveryId: delivery.id,
            distance: elements[i].distance.value 
        }));
    }

}