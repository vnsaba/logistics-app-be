export interface IDistanceService {
    getDistancesFromGoogle(
        originLat: number,
        originLng: number,
        deliveries: { id: string; latitude: number; longitude: number }[]
    ): Promise<Array<{ deliveryId: string; distance: number }>>;
}