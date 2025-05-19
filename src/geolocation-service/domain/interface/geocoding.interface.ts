export interface GeocodingService {
  geocode(address: string): Promise<{ latitude: number; longitude: number }>;
}