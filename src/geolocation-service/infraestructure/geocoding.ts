import axios from 'axios';
import { GeocodingService } from '../../geolocation-service/domain/interface/geocoding.interface';


export class GoogleMapsGeocodingService implements GeocodingService {
    constructor(private readonly apikey: string) { }

    async geocode(address: string): Promise<{ latitude: number; longitude: number; }> {
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
            return {
                latitude: location.lat,
                longitude: location.lng
            }
        } catch (error) {
            console.error('Error during geocoding:', error);
            throw new Error('Geocoding service is unavailable');
        }
    }

    public async reverseGeocode(latitude: number, longitude: number): Promise<string> {
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
                params: {
                    latlng: `${latitude},${longitude}`,
                    key: this.apikey,
                },
            });

            if (response.data.status !== 'OK') {
                throw new Error(`Reverse geocoding failed: ${response.data.status}`);
            }

            const address = response.data.results[0].formatted_address;
            return address;
        } catch (error) {
            console.error('Error during reverse geocoding:', error);
            throw new Error('Reverse geocoding service is unavailable');
        }
    }


}