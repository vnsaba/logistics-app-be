import axios from 'axios';
import { GeocodingService } from '../../geolocation-service/domain/interface/geocoding.interface';
import dotenv from 'dotenv';
dotenv.config();

export class GoogleMapsGeocodingService implements GeocodingService {
    constructor(private readonly apikey: string) {}

    async geocode(address: string): Promise<{ latitude: number; longitude: number; }> {
        console.log('apikey:', this.apikey);
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
                params: {
                    address: address,
                    key: this.apikey,
                },
            });

            if (response.data.status !== 'OK') {
                throw new Error(`Geocoding failed: ${response.data.status}`);
            }

            const location = response.data.results[0].geometry.location;
            console.log('Geocoding result:', location);
            return {
                latitude: location.lat,
                longitude: location.lng
            }
        } catch (error) {
            console.error('Error during geocoding:', error);
            throw new Error('Geocoding service is unavailable');
        }
    }

}