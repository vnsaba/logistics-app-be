export interface GeocodingService {
  geocode(address: string): Promise<{ latitude: number; longitude: number }>;
  reverseGeocode(latitude: number, longitude: number): Promise<string>;
}